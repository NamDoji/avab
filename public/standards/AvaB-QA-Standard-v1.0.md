# AvaB QA Standard v1.0
## Tài Liệu Kiểm Định Chất Lượng Học Liệu — AvaB Learning System

---

```
Document ID  : AVAB-QA-STD-001
Version      : 1.0.0
Effective     : 2026-07-04
Owner        : AvaB Curriculum & QA Team
Classification: Internal — Educational Standard
Status       : Active
```

---

## 📋 Mục Lục

1. [QA Philosophy & Scope](#1-qa-philosophy--scope)
2. [QA Criteria Matrix](#2-qa-criteria-matrix)
3. [QA Scoring System](#3-qa-scoring-system)
4. [QA Process — Auto + Manual](#4-qa-process--auto--manual)
5. [QA Checklists Chi Tiết](#5-qa-checklists-chi-tiết)
6. [Error Classification & Handling](#6-error-classification--handling)
7. [QA Dashboard & Reporting](#7-qa-dashboard--reporting)
8. [JSON Schema cho QA Report](#8-json-schema-cho-qa-report)
9. [Database Design](#9-database-design)
10. [Admin UI Design](#10-admin-ui-design)
11. [Integration Points](#11-integration-points)
12. [Continuous Improvement](#12-continuous-improvement)
13. [Appendix](#13-appendix)

---

## 1. QA Philosophy & Scope

### 1.1 Tuyên Ngôn QA

> **"Every child deserves accurate, age-appropriate, engaging content."**
>
> Mỗi bài học, mỗi bài tập, mỗi video, mỗi câu hỏi của AI Tutor — đều là một khoảnh khắc học tập. Khoảnh khắc đó phải đúng, phải phù hợp, và phải truyền cảm hứng.

QA không phải rào cản — QA là lớp bảo vệ cuối cùng cho học sinh và phụ huynh.

### 1.2 Nguyên Tắc Cốt Lõi

| # | Nguyên tắc | Diễn giải |
|---|---|---|
| P1 | **Accuracy First** | Không có ngoại lệ cho nội dung sai. Một đáp án sai có thể khắc sâu kiến thức sai cho cả đời. |
| P2 | **Age-Appropriate Always** | Ngôn ngữ, ví dụ, hình ảnh — tất cả phải phù hợp tâm lý và nhận thức độ tuổi. |
| P3 | **Pedagogically Sound** | Nội dung phải dựa trên nguyên lý sư phạm đã được kiểm chứng, không phải cảm tính. |
| P4 | **Culturally Sensitive** | Tôn trọng đa dạng văn hóa, không gây định kiến, không loại trừ. |
| P5 | **Accessible by Design** | Mọi học sinh, kể cả học sinh có nhu cầu đặc biệt, đều có thể tiếp cận. |
| P6 | **Continuous Improvement** | QA là vòng lặp, không phải cổng một chiều. Dữ liệu thực tế phải phản hồi ngược vào tiêu chuẩn. |

### 1.3 Phạm Vi Áp Dụng

```
┌─────────────────────────────────────────────────────────────────┐
│                        AvaB Content Universe                     │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   LESSON     │   THEORY     │   EXERCISE   │    HOMEWORK        │
│  (Bài học)   │  (Lý thuyết) │  (Bài tập)   │  (Bài tập về nhà) │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│    VIDEO     │  AI TUTOR    │ ASSESSMENT   │  ILLUSTRATION      │
│   (Video)    │  (Gia sư AI) │  (Kiểm tra)  │  (Minh họa)        │
└──────────────┴──────────────┴──────────────┴────────────────────┘
           ALL types → QA REQUIRED before publish
```

#### Định Nghĩa Các Loại Học Liệu

| Loại | Định nghĩa | Ví dụ |
|---|---|---|
| **Lesson** | Đơn vị học tập hoàn chỉnh, bao gồm Theory + Exercise + Homework | "Phép nhân có nhớ lớp 3" |
| **Theory** | Phần lý thuyết, giải thích khái niệm | "Khái niệm phân số" |
| **Exercise** | Bài tập trong giờ học, có đáp án | "Tính: 3/4 + 1/4 = ?" |
| **Homework** | Bài tập về nhà, có rubric chấm | "Giải bài toán có lời văn" |
| **Video** | Nội dung video giảng dạy | "Video giải thích phân số bằng pizza" |
| **AI Tutor** | Phản hồi, gợi ý từ AI Tutor trong session học | Scaffolding hints khi học sinh sai |
| **Assessment** | Bài kiểm tra, đánh giá tiến độ | "Kiểm tra cuối chương Phân Số" |
| **Illustration** | Hình ảnh, sơ đồ minh họa kèm theo nội dung | Sơ đồ phân số trên số thực |

### 1.4 Không Thuộc Phạm Vi QA v1.0

- Nội dung do học sinh tạo ra (user-generated)
- Câu trả lời thực tế của học sinh (chỉ giám sát, không QA)
- Giao diện UI/UX (thuộc Design QA riêng)
- Performance backend (thuộc Engineering QA)

---

## 2. QA Criteria Matrix

### 2.1 Ma Trận Tiêu Chí Đầy Đủ

> **Ký hiệu:** `MUST` = Bắt buộc (vi phạm → reject) | `SHOULD` = Khuyến nghị (vi phạm → trừ điểm) | `MAY` = Tùy chọn | `N/A` = Không áp dụng

| # | Tiêu Chí | Lesson | Theory | Exercise | Homework | Video | AI Tutor | Assessment | Illustration |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| C01 | **Accuracy** — Nội dung đúng về mặt học thuật | MUST | MUST | MUST | MUST | MUST | MUST | MUST | MUST |
| C02 | **Age Appropriateness** — Phù hợp lứa tuổi | MUST | MUST | MUST | MUST | MUST | MUST | MUST | MUST |
| C03 | **Ngôn ngữ** — Chính tả, ngữ pháp, từ vựng | MUST | MUST | MUST | MUST | MUST | MUST | MUST | SHOULD |
| C04 | **Hình ảnh phù hợp** — An toàn, không gây hiểu lầm | MUST | SHOULD | SHOULD | SHOULD | MUST | N/A | SHOULD | MUST |
| C05 | **Logic & Cấu trúc** — Mạch lạc, trình tự đúng | MUST | MUST | MUST | MUST | SHOULD | MUST | MUST | SHOULD |
| C06 | **Đáp án chính xác** — Verified đáp án | N/A | N/A | MUST | MUST | N/A | SHOULD | MUST | N/A |
| C07 | **Độ khó phù hợp** — Đúng level curriculum | MUST | MUST | MUST | MUST | MUST | MUST | MUST | N/A |
| C08 | **Thời lượng** — Trong giới hạn cho phép | SHOULD | MUST | SHOULD | MUST | MUST | SHOULD | MUST | N/A |
| C09 | **Accessibility** — Có alt-text, contrast, font | SHOULD | SHOULD | SHOULD | SHOULD | MUST | SHOULD | SHOULD | MUST |
| C10 | **Không phản sư phạm** — Không gây harm học tập | MUST | MUST | MUST | MUST | MUST | MUST | MUST | MUST |
| C11 | **Nhất quán thuật ngữ** — Dùng đúng từ chuẩn AvaB | MUST | MUST | SHOULD | SHOULD | MUST | MUST | MUST | N/A |
| C12 | **Cấu trúc dữ liệu** — Đúng schema, không thiếu field | MUST | MUST | MUST | MUST | MUST | MUST | MUST | MUST |
| C13 | **Learning Objective** — Rõ ràng, đo được | MUST | SHOULD | N/A | N/A | SHOULD | N/A | MUST | N/A |
| C14 | **Rubric/Giải thích** — Có hướng dẫn chấm/giải | N/A | N/A | MUST | MUST | N/A | SHOULD | MUST | N/A |
| C15 | **Không trùng lặp** — Không copy từ bài khác | MUST | MUST | MUST | MUST | MUST | N/A | MUST | MUST |
| C16 | **Cultural Sensitivity** — Tôn trọng đa dạng | MUST | MUST | MUST | MUST | MUST | MUST | MUST | MUST |
| C17 | **Cognitive Load** — Không quá tải nhận thức | SHOULD | SHOULD | SHOULD | SHOULD | SHOULD | MUST | SHOULD | SHOULD |
| C18 | **Engagement** — Hấp dẫn, truyền cảm hứng | SHOULD | SHOULD | SHOULD | SHOULD | MUST | SHOULD | SHOULD | MAY |
| C19 | **Parent-Friendly** — PH hiểu được mục đích | SHOULD | N/A | SHOULD | MUST | SHOULD | N/A | SHOULD | N/A |
| C20 | **Instructor Note** — Hướng dẫn cho GV (nếu có) | MAY | MAY | SHOULD | SHOULD | MAY | N/A | SHOULD | N/A |

### 2.2 Trọng Số Tiêu Chí theo Loại

| Nhóm Tiêu Chí | Mô tả | Trọng số |
|---|---|:---:|
| **Academic Integrity** (C01, C06, C10) | Tính chính xác học thuật | 35% |
| **Safety & Appropriateness** (C02, C04, C16) | An toàn và phù hợp | 25% |
| **Language & Structure** (C03, C05, C11, C12) | Ngôn ngữ và cấu trúc | 20% |
| **Pedagogy** (C07, C08, C13, C14, C17) | Giá trị sư phạm | 15% |
| **UX & Accessibility** (C09, C15, C18, C19, C20) | Trải nghiệm và tiếp cận | 5% |

---

## 3. QA Scoring System

### 3.1 Thang Điểm QA

```
┌────────────────────────────────────────────────────────────────┐
│                     QA SCORING SCALE (0–100)                    │
├──────────────┬──────────────────────────────────────────────────┤
│  90 – 100    │ ✅ EXCELLENT — Publish immediately               │
│  80 – 89     │ ✅ PASS — Minor review optional, can publish     │
│  60 – 79     │ ⚠️  REVIEW — Human QA required before publish   │
│  40 – 59     │ ❌ FAIL — Must fix and re-submit                 │
│   0 – 39     │ ❌ REJECT — Major rework required               │
└──────────────┴──────────────────────────────────────────────────┘

SPECIAL RULE: Bất kỳ MUST criterion nào FAIL → Status = REJECT
              bất kể total score là bao nhiêu.
```

### 3.2 Công Thức Tính Điểm

```
Total_Score = Σ (Category_Score × Category_Weight)

Category_Score = (Passed_Items / Total_Applicable_Items) × 100
               - (SHOULD_Violations × 3)
               - (MUST_Violations × 20)  [cộng thêm vào penalty]

Min(Total_Score) = 0
```

#### Bảng Tính Điểm Mẫu — Exercise

| Tiêu chí | Type | Points | Pass? | Score |
|---|---|:---:|:---:|:---:|
| Accuracy (C01) | MUST | 35 | ✅ | 35 |
| Age Appropriate (C02) | MUST | 10 | ✅ | 10 |
| Ngôn ngữ (C03) | MUST | 8 | ✅ | 8 |
| Logic (C05) | MUST | 8 | ✅ | 8 |
| Đáp án đúng (C06) | MUST | 9 | ✅ | 9 |
| Độ khó (C07) | MUST | 5 | ⚠️ SHOULD | 3 |
| Không phản SP (C10) | MUST | 10 | ✅ | 10 |
| Cultural (C16) | MUST | 5 | ✅ | 5 |
| Rubric (C14) | SHOULD | 5 | ✅ | 5 |
| Accessibility (C09) | SHOULD | 5 | ❌ | 0 |
| **TOTAL** | | **100** | | **93** |

→ Status: **PASS (Excellent)**

### 3.3 Penalty Matrix

| Vi phạm | Loại | Điểm trừ | Ghi chú |
|---|---|:---:|---|
| MUST criterion fail | Critical | -20 + Auto-reject | Không thể vượt qua |
| SHOULD criterion fail | High | -5 per violation | Tích lũy |
| MAY criterion fail | Low | -1 per violation | Tích lũy |
| Duplicate content >30% | Critical | -30 | Cần review |
| Wrong schema field | High | -10 | |
| Missing required field | Critical | -15 | |

### 3.4 QA Score Normalization per Content Type

Do một số tiêu chí không áp dụng (N/A), điểm được normalize:

```python
# Pseudo-code
applicable_weight = sum(weight for c in criteria if c.applicable)
raw_score = sum(c.score for c in criteria if c.applicable)
normalized_score = (raw_score / applicable_weight) * 100
```

---

## 4. QA Process — Auto + Manual

### 4.1 QA Workflow Tổng Thể

```
                    ┌─────────────────────┐
                    │  Content Generated   │
                    │  (AI / Human Editor) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Auto QA Engine    │
                    │  (AI-Powered Checks) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
         │  PASS   │     │ REVIEW  │     │  FAIL   │
         │ ≥80 pts │     │60-79pts │     │ <60 pts │
         └────┬────┘     └────┬────┘     └────┬────┘
              │               │                │
    ┌─────────▼──┐    ┌───────▼─────┐  ┌──────▼──────┐
    │Minor Review│    │  Human QA   │  │   Reject    │
    │(automated) │    │  Required   │  │ Regenerate  │
    └─────────┬──┘    └───────┬─────┘  └─────────────┘
              │               │
              │        ┌──────▼──────┐
              │        │  Fix Issues │
              │        └──────┬──────┘
              │               │
              │        ┌──────▼──────┐
              │        │Re-Auto QA   │
              │        └──────┬──────┘
              │               │
              └───────────────┤
                              │
                   ┌──────────▼─────────┐
                   │  Publishing Gate   │
                   │  (QA Score ≥ 80)   │
                   └──────────┬─────────┘
                              │
                   ┌──────────▼─────────┐
                   │     Published      │
                   └──────────┬─────────┘
                              │
                   ┌──────────▼─────────┐
                   │ Post-Pub Monitor   │
                   │ (Student feedback, │
                   │  error patterns)   │
                   └──────────┬─────────┘
                              │
                   ┌──────────▼─────────┐
                   │  Version Update    │
                   │  (if needed)       │
                   └────────────────────┘
```

### 4.2 Auto QA — Chi Tiết

#### 4.2.1 Các Bước Auto QA

| Step | Check | Công cụ | Thời gian | Output |
|---|---|---|---|---|
| AQ-01 | **Schema Validation** | JSON Schema validator | <1s | Pass/Fail + field list |
| AQ-02 | **Spell Check** | Vietnamese NLP engine | 2-5s | Word list với lỗi |
| AQ-03 | **Grammar Check** | AI grammar model | 3-8s | Issues với severity |
| AQ-04 | **Duplicate Detection** | Content fingerprint | 5-10s | Similarity % + matches |
| AQ-05 | **Answer Verification** | Math/logic engine | 2-5s | Correct/Incorrect per Q |
| AQ-06 | **Readability Score** | Flesch-Kincaid VN adapted | 2-3s | Score + Grade Level |
| AQ-07 | **Image Metadata Check** | EXIF + AI image classifier | 3-15s | Safety score |
| AQ-08 | **Cognitive Load Estimate** | AI analysis | 5-10s | Load level (Low/Med/High) |
| AQ-09 | **Level Appropriateness** | Curriculum alignment model | 3-5s | Alignment score |
| AQ-10 | **Terminology Consistency** | AvaB glossary check | 1-2s | Non-standard terms list |

#### 4.2.2 Readability Score — Flesch-Kincaid VN Adapted

```
AvaB Readability Index (ARI) — Adapted cho tiếng Việt:

ARI = 4.71 × (chars/words) + 0.5 × (words/sentences) - 21.43

Grade Level Mapping:
  ARI < 5   → Grade 1-2   (Rất dễ)
  ARI 5-7   → Grade 3-4   (Dễ)
  ARI 7-9   → Grade 5-6   (Trung bình)
  ARI 9-11  → Grade 7-9   (Khó)
  ARI > 11  → Grade 10+   (Rất khó)

MUST: ARI phù hợp với target_grade ± 1
```

#### 4.2.3 Answer Verification Logic

```python
# Pseudo-code cho Auto Answer Verification

def verify_answer(question):
    if question.type == "MULTIPLE_CHOICE":
        # Kiểm tra: chỉ 1 đáp án đúng
        correct_count = count(q.options where q.is_correct == True)
        assert correct_count == 1, "MUST FAIL: Multiple correct answers"
        
    elif question.type == "TRUE_FALSE":
        # Kiểm tra: T/F có nhất quán với lý thuyết
        fact_check_score = ai_fact_check(question.statement)
        assert fact_check_score > 0.85, "Review required"
        
    elif question.type == "NUMERIC":
        # Tính toán lại đáp án
        computed = calculate(question.formula)
        assert abs(computed - question.answer) < 0.001, "MUST FAIL: Wrong answer"
        
    elif question.type == "FILL_IN_BLANK":
        # Kiểm tra acceptable answers list không rỗng
        assert len(question.acceptable_answers) >= 1
        # Kiểm tra context phù hợp
        
    elif question.type == "OPEN_ENDED":
        # Chỉ kiểm tra rubric có đủ không
        assert question.rubric is not None
        assert len(question.rubric.criteria) >= 2
```

### 4.3 Manual QA — Chi Tiết

#### 4.3.1 Reviewer Assignment

| Content Type | Reviewer Level | Thời gian review | Turnaround |
|---|---|:---:|:---:|
| Lesson | Senior Reviewer | 30-45 phút | 24h |
| Theory | Subject Expert | 20-30 phút | 24h |
| Exercise | QA Reviewer | 10-15 phút | 12h |
| Homework | Senior Reviewer | 20-30 phút | 24h |
| Video | Senior + AV QA | 60-90 phút | 48h |
| AI Tutor | AI Safety Reviewer | 30-45 phút | 24h |
| Assessment | Subject Expert | 45-60 phút | 48h |

#### 4.3.2 Manual QA Focus Areas

**Human reviewers tập trung vào những gì AI không thể kiểm tra:**

1. **Content Accuracy Depth** — Kiểm tra sâu tính chính xác học thuật, không chỉ surface level
2. **Pedagogical Appropriateness** — Phương pháp dạy có phù hợp lý luận sư phạm không
3. **Cultural Sensitivity** — Ví dụ, hình ảnh có vô tình gây định kiến không
4. **Edge Cases in Answers** — Các trường hợp biên có đáp án tốt không
5. **Open-Ended Rubric Quality** — Rubric có công bằng và đủ không
6. **Emotional Tone** — Ngôn ngữ có khuyến khích, không gây lo lắng không
7. **Parent Communication** — Parent note có đủ thông tin cho phụ huynh không

#### 4.3.3 Conflict Resolution

Khi Auto QA và Manual QA có kết quả xung đột:

```
┌─────────────────────────────────────────────────────┐
│              CONFLICT RESOLUTION PROTOCOL            │
├───────────────────────┬─────────────────────────────┤
│ Auto: FAIL            │ Human: PASS                 │
│ → Escalate to Senior  │ Human must document why     │
│   Reviewer            │ Override needs approval     │
├───────────────────────┼─────────────────────────────┤
│ Auto: PASS            │ Human: FAIL                 │
│ → Human judgment wins │ Update Auto QA model        │
│   Document for model  │ (false positive learning)   │
│   improvement         │                             │
├───────────────────────┼─────────────────────────────┤
│ Two Humans disagree   │ → Senior Reviewer decides   │
│                       │ → Document reasoning        │
└───────────────────────┴─────────────────────────────┘
```

---

## 5. QA Checklists Chi Tiết

### 5.1 Lesson QA Checklist (40 items)

```
LESSON QA CHECKLIST v1.0
Content ID: ____________  Reviewer: ____________  Date: ____________
```

#### 5.1.A Metadata & Structure (10 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| L01 | Lesson ID đúng format `LES-{GRADE}{SUBJECT}-{SEQ}` | MUST | ☐ | ☐ | ☐ | |
| L02 | Grade/Subject mapping chính xác | MUST | ☐ | ☐ | ☐ | |
| L03 | Learning objective hiện diện và đúng format SMART+Bloom | MUST | ☐ | ☐ | ☐ | |
| L04 | Có đủ components: Theory + Exercise + Homework (tối thiểu) | MUST | ☐ | ☐ | ☐ | |
| L05 | Thời lượng ước tính trong giới hạn: 20-45 phút (theo grade) | MUST | ☐ | ☐ | ☐ | |
| L06 | Tags/keywords có ít nhất 3 tags phù hợp | SHOULD | ☐ | ☐ | ☐ | |
| L07 | Prerequisites list đúng với curriculum map | MUST | ☐ | ☐ | ☐ | |
| L08 | Difficulty level (1-5) nhất quán với nội dung | MUST | ☐ | ☐ | ☐ | |
| L09 | Curriculum alignment reference hợp lệ | MUST | ☐ | ☐ | ☐ | |
| L10 | Version history được ghi chép | SHOULD | ☐ | ☐ | ☐ | |

#### 5.1.B Theory Component (8 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| L11 | Theory length phù hợp: 150-400 từ cho tiểu học, 300-600 từ cho THCS | MUST | ☐ | ☐ | ☐ | |
| L12 | Ngôn ngữ phù hợp độ tuổi, không dùng từ kỹ thuật không giải thích | MUST | ☐ | ☐ | ☐ | |
| L13 | Có ít nhất 1 ví dụ cụ thể, gần gũi với học sinh | MUST | ☐ | ☐ | ☐ | |
| L14 | Định nghĩa key term rõ ràng | MUST | ☐ | ☐ | ☐ | |
| L15 | Cấu trúc logic: từ đơn giản đến phức tạp | MUST | ☐ | ☐ | ☐ | |
| L16 | Không có thông tin sai, outdated | MUST | ☐ | ☐ | ☐ | |
| L17 | Có kết nối với kiến thức đã học (prior knowledge hook) | SHOULD | ☐ | ☐ | ☐ | |
| L18 | Hình ảnh/diagram minh họa (nếu có) phù hợp và chính xác | SHOULD | ☐ | ☐ | ☐ | |

#### 5.1.C Exercise Component (8 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| L19 | Có ít nhất 5 câu hỏi practice | MUST | ☐ | ☐ | ☐ | |
| L20 | Mix types: ít nhất 2 loại câu hỏi khác nhau | SHOULD | ☐ | ☐ | ☐ | |
| L21 | Tất cả đáp án đã verified (xem Exercise Checklist) | MUST | ☐ | ☐ | ☐ | |
| L22 | Độ khó tăng dần (easy → medium → hard) | SHOULD | ☐ | ☐ | ☐ | |
| L23 | Câu hỏi không lặp ý | MUST | ☐ | ☐ | ☐ | |
| L24 | Điểm số phân bổ hợp lý | SHOULD | ☐ | ☐ | ☐ | |
| L25 | Có feedback/giải thích khi sai | MUST | ☐ | ☐ | ☐ | |
| L26 | Không có câu hỏi gây hiểu lầm (ambiguous) | MUST | ☐ | ☐ | ☐ | |

#### 5.1.D Homework Component (6 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| L27 | Homework link/reference đúng | MUST | ☐ | ☐ | ☐ | |
| L28 | Thời lượng HW phù hợp: ≤20 phút tiểu học, ≤30 phút THCS | MUST | ☐ | ☐ | ☐ | |
| L29 | HW có rubric chấm rõ ràng | MUST | ☐ | ☐ | ☐ | |
| L30 | Phụ huynh có thể hiểu và hỗ trợ con | SHOULD | ☐ | ☐ | ☐ | |
| L31 | HW consolidates lesson content, không dạy kiến thức mới | MUST | ☐ | ☐ | ☐ | |
| L32 | Có parent note hướng dẫn | SHOULD | ☐ | ☐ | ☐ | |

#### 5.1.E Safety & Quality (8 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| L33 | Không có nội dung bạo lực, phân biệt | MUST | ☐ | ☐ | ☐ | |
| L34 | Tôn trọng đa dạng giới tính, dân tộc, địa phương | MUST | ☐ | ☐ | ☐ | |
| L35 | Không có brand/product commercial endorsement | MUST | ☐ | ☐ | ☐ | |
| L36 | Không link ra external resources không được approve | MUST | ☐ | ☐ | ☐ | |
| L37 | Font size, spacing phù hợp cho màn hình nhỏ | SHOULD | ☐ | ☐ | ☐ | |
| L38 | Spelling check passed (≤2 typos cho SHOULD, 0 MUST nội dung) | MUST | ☐ | ☐ | ☐ | |
| L39 | Không trùng lặp >30% với lesson khác trong cùng chủ đề | MUST | ☐ | ☐ | ☐ | |
| L40 | Overall pedagogical flow: Engage → Explore → Explain → Elaborate → Evaluate | SHOULD | ☐ | ☐ | ☐ | |

---

### 5.2 Exercise QA Checklist (28 items)

```
EXERCISE QA CHECKLIST v1.0
Content ID: ____________  Reviewer: ____________  Date: ____________
```

#### 5.2.A Question Quality (12 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| E01 | Câu hỏi diễn đạt rõ ràng, không mơ hồ | MUST | ☐ | ☐ | ☐ | |
| E02 | Câu hỏi ngắn gọn, không thừa thông tin | SHOULD | ☐ | ☐ | ☐ | |
| E03 | Ngôn ngữ phù hợp lứa tuổi | MUST | ☐ | ☐ | ☐ | |
| E04 | Context/ngữ cảnh đủ để trả lời (không thiếu thông tin) | MUST | ☐ | ☐ | ☐ | |
| E05 | Không có câu hỏi dẫn dắt (leading question) | MUST | ☐ | ☐ | ☐ | |
| E06 | Câu hỏi không gây lo lắng/sợ hãi | MUST | ☐ | ☐ | ☐ | |
| E07 | Câu hỏi bao phủ learning objective của lesson | MUST | ☐ | ☐ | ☐ | |
| E08 | Bloom's taxonomy level phù hợp | SHOULD | ☐ | ☐ | ☐ | |
| E09 | Không có double-barreled questions | MUST | ☐ | ☐ | ☐ | |
| E10 | Hình ảnh (nếu có) rõ ràng, đúng kích thước | SHOULD | ☐ | ☐ | ☐ | |
| E11 | Số liệu, đơn vị đo lường đúng và nhất quán | MUST | ☐ | ☐ | ☐ | |
| E12 | Format hiển thị đúng (công thức toán, ký tự đặc biệt) | MUST | ☐ | ☐ | ☐ | |

#### 5.2.B Multiple Choice Specific (6 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| E13 | Chỉ có đúng 1 đáp án chính xác | MUST | ☐ | ☐ | ☐ | |
| E14 | Các distractors hợp lý (không vô lý, không quá dễ loại) | MUST | ☐ | ☐ | ☐ | |
| E15 | Không có distractors nào "gần đúng" đến mức gây nhầm | MUST | ☐ | ☐ | ☐ | |
| E16 | Tất cả options cùng dạng/độ dài tương đương | SHOULD | ☐ | ☐ | ☐ | |
| E17 | Không có "all of the above" / "none of the above" | SHOULD | ☐ | ☐ | ☐ | |
| E18 | Thứ tự options hợp lý (A,B,C,D không theo pattern đặc biệt) | SHOULD | ☐ | ☐ | ☐ | |

#### 5.2.C Answer & Explanation (6 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| E19 | Đáp án đã được tính toán/xác minh độc lập | MUST | ☐ | ☐ | ☐ | |
| E20 | Giải thích đáp án đúng rõ ràng, đủ bước | MUST | ☐ | ☐ | ☐ | |
| E21 | Có giải thích tại sao các options sai (với MC) | SHOULD | ☐ | ☐ | ☐ | |
| E22 | Acceptable answers list đầy đủ (với fill-in-blank) | MUST | ☐ | ☐ | ☐ | |
| E23 | Rubric chấm mở rõ ràng, khách quan (với open-ended) | MUST | ☐ | ☐ | ☐ | |
| E24 | Hint system (nếu có) không reveal đáp án quá sớm | SHOULD | ☐ | ☐ | ☐ | |

#### 5.2.D Difficulty & Calibration (4 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| E25 | Độ khó phù hợp level được gán | MUST | ☐ | ☐ | ☐ | |
| E26 | Thời gian làm bài ước tính hợp lý | SHOULD | ☐ | ☐ | ☐ | |
| E27 | Điểm số phân bổ công bằng với độ khó | SHOULD | ☐ | ☐ | ☐ | |
| E28 | Không có câu quá dễ đến mức không có giá trị đánh giá | SHOULD | ☐ | ☐ | ☐ | |

---

### 5.3 AI Tutor QA Checklist (24 items)

```
AI TUTOR QA CHECKLIST v1.0
Tutor Config ID: ____________  Reviewer: ____________  Date: ____________
```

#### 5.3.A Answer Guidance Principles (8 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| T01 | AI Tutor KHÔNG đưa đáp án trực tiếp (Socratic method) | MUST | ☐ | ☐ | ☐ | |
| T02 | Scaffolding chia nhỏ vấn đề, hướng dẫn từng bước | MUST | ☐ | ☐ | ☐ | |
| T03 | Có ít nhất 3 levels của hints (từ nhẹ đến cụ thể hơn) | MUST | ☐ | ☐ | ☐ | |
| T04 | Chỉ reveal đáp án sau khi học sinh đã thử ít nhất 3 lần | MUST | ☐ | ☐ | ☐ | |
| T05 | Gợi ý liên kết với kiến thức học sinh đã biết | SHOULD | ☐ | ☐ | ☐ | |
| T06 | Không gợi ý dẫn đến sai hướng | MUST | ☐ | ☐ | ☐ | |
| T07 | Khi học sinh đúng: reinforcement rõ ràng, cụ thể | MUST | ☐ | ☐ | ☐ | |
| T08 | Khi học sinh sai: không criticize, redirect tích cực | MUST | ☐ | ☐ | ☐ | |

#### 5.3.B Language & Tone (6 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| T09 | Ngôn ngữ thân thiện, khuyến khích | MUST | ☐ | ☐ | ☐ | |
| T10 | Từ vựng phù hợp lứa tuổi (test với target grade level) | MUST | ☐ | ☐ | ☐ | |
| T11 | Câu ngắn, dễ đọc (max 20 từ/câu cho tiểu học) | SHOULD | ☐ | ☐ | ☐ | |
| T12 | Không dùng sarcasm, irony với học sinh nhỏ | MUST | ☐ | ☐ | ☐ | |
| T13 | Không so sánh học sinh với nhau | MUST | ☐ | ☐ | ☐ | |
| T14 | Có variation trong phản hồi (không lặp từ ngữ nhàm) | SHOULD | ☐ | ☐ | ☐ | |

#### 5.3.C Safety & Boundaries (6 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| T15 | AI không claim là con người | MUST | ☐ | ☐ | ☐ | |
| T16 | Từ chối câu hỏi off-topic đúng cách | MUST | ☐ | ☐ | ☐ | |
| T17 | Không thu thập thông tin cá nhân | MUST | ☐ | ☐ | ☐ | |
| T18 | Có graceful exit khi học sinh frustrated | MUST | ☐ | ☐ | ☐ | |
| T19 | Prompt injection protection được test | MUST | ☐ | ☐ | ☐ | |
| T20 | Không có hallucinated facts | MUST | ☐ | ☐ | ☐ | |

#### 5.3.D Learning Effectiveness (4 items)

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| T21 | Tutor dẫn đến đúng learning outcome | MUST | ☐ | ☐ | ☐ | |
| T22 | Không tạo dependency (học sinh phải tự làm được sau tutor session) | SHOULD | ☐ | ☐ | ☐ | |
| T23 | Tracking hint usage để adaptive | SHOULD | ☐ | ☐ | ☐ | |
| T24 | Kết thúc session với summary/recap | SHOULD | ☐ | ☐ | ☐ | |

---

### 5.4 Video QA Checklist (22 items)

```
VIDEO QA CHECKLIST v1.0
Video ID: ____________  Reviewer: ____________  Date: ____________
Duration: ______ phút
```

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| V01 | Thời lượng: 3-8 phút (tiểu học), 5-12 phút (THCS) | MUST | ☐ | ☐ | ☐ | |
| V02 | Âm thanh rõ ràng, không echo, noise | MUST | ☐ | ☐ | ☐ | |
| V03 | Có phụ đề / subtitles đúng | MUST | ☐ | ☐ | ☐ | |
| V04 | Phụ đề đồng bộ với audio | MUST | ☐ | ☐ | ☐ | |
| V05 | Video resolution ≥ 720p | MUST | ☐ | ☐ | ☐ | |
| V06 | Không có copyright violation (nhạc, hình ảnh) | MUST | ☐ | ☐ | ☐ | |
| V07 | Nội dung chính xác học thuật | MUST | ☐ | ☐ | ☐ | |
| V08 | Tốc độ nói phù hợp: 120-150 từ/phút cho học sinh | MUST | ☐ | ☐ | ☐ | |
| V09 | Có intro rõ ràng (học gì hôm nay) | MUST | ☐ | ☐ | ☐ | |
| V10 | Có summary cuối video | SHOULD | ☐ | ☐ | ☐ | |
| V11 | Animation/graphics hỗ trợ hiểu, không distract | SHOULD | ☐ | ☐ | ☐ | |
| V12 | Font chữ readable trên màn hình nhỏ (≥18pt) | MUST | ☐ | ☐ | ☐ | |
| V13 | Color contrast ≥ 4.5:1 (WCAG AA) | MUST | ☐ | ☐ | ☐ | |
| V14 | Không có flashing content >3Hz (seizure risk) | MUST | ☐ | ☐ | ☐ | |
| V15 | Giọng đọc thân thiện, không đơn điệu | SHOULD | ☐ | ☐ | ☐ | |
| V16 | Không có hình ảnh không phù hợp | MUST | ☐ | ☐ | ☐ | |
| V17 | Ví dụ trong video gần gũi, relate-able | SHOULD | ☐ | ☐ | ☐ | |
| V18 | Engagement hooks trong 30 giây đầu | SHOULD | ☐ | ☐ | ☐ | |
| V19 | Có chapter markers (nếu dài hơn 5 phút) | SHOULD | ☐ | ☐ | ☐ | |
| V20 | Thumbnail phù hợp, không clickbait | MUST | ☐ | ☐ | ☐ | |
| V21 | Alt description có sẵn cho screen readers | MUST | ☐ | ☐ | ☐ | |
| V22 | Không có branded content/sponsorship không approve | MUST | ☐ | ☐ | ☐ | |

---

### 5.5 Assessment QA Checklist (20 items)

```
ASSESSMENT QA CHECKLIST v1.0
Assessment ID: ____________  Reviewer: ____________  Date: ____________
```

| # | Item | Type | Pass | Fail | N/A | Notes |
|---|---|:---:|:---:|:---:|:---:|---|
| A01 | Assessment map to learning objectives 1:1 | MUST | ☐ | ☐ | ☐ | |
| A02 | Phân bố điểm phản ánh tầm quan trọng của từng objective | MUST | ☐ | ☐ | ☐ | |
| A03 | Câu hỏi cover đủ content (không bỏ sót topic lớn) | MUST | ☐ | ☐ | ☐ | |
| A04 | Có mix Bloom levels: Remember, Understand, Apply tối thiểu | MUST | ☐ | ☐ | ☐ | |
| A05 | Thời gian làm bài phù hợp (không quá gấp, không quá thừa) | MUST | ☐ | ☐ | ☐ | |
| A06 | Rubric chấm rõ ràng, khách quan cho toàn bộ | MUST | ☐ | ☐ | ☐ | |
| A07 | Không có câu hỏi "trick" gây nhầm lẫn không cần thiết | MUST | ☐ | ☐ | ☐ | |
| A08 | Tất cả đáp án verified | MUST | ☐ | ☐ | ☐ | |
| A09 | Grade boundary (80%, 60%, etc.) được ghi rõ | MUST | ☐ | ☐ | ☐ | |
| A10 | Có feedback message cho từng grade band | SHOULD | ☐ | ☐ | ☐ | |
| A11 | Không có câu hỏi từ internet / có copyright | MUST | ☐ | ☐ | ☐ | |
| A12 | Câu hỏi không leaked từ assessment khác | MUST | ☐ | ☐ | ☐ | |
| A13 | Có remediation path khi fail | SHOULD | ☐ | ☐ | ☐ | |
| A14 | Không discriminate theo socioeconomic (ví dụ về luxury) | MUST | ☐ | ☐ | ☐ | |
| A15 | Instruction rõ ràng cho học sinh | MUST | ☐ | ☐ | ☐ | |
| A16 | Có example question (nếu có format lạ) | SHOULD | ☐ | ☐ | ☐ | |
| A17 | Tính điểm tự động đúng | MUST | ☐ | ☐ | ☐ | |
| A18 | Report kết quả có đủ thông tin actionable | SHOULD | ☐ | ☐ | ☐ | |
| A19 | Có privacy protection (không expose điểm cho học sinh khác) | MUST | ☐ | ☐ | ☐ | |
| A20 | Phụ huynh nhận kết quả với context đúng | SHOULD | ☐ | ☐ | ☐ | |

---

## 6. Error Classification & Handling

### 6.1 Error Severity Matrix

| Severity | Màu | Mô tả | Ví dụ cụ thể |
|---|:---:|---|---|
| **CRITICAL** | 🔴 | Sai nghiêm trọng, ảnh hưởng trực tiếp học tập hoặc an toàn | Đáp án sai, nội dung bạo lực, thông tin nguy hiểm |
| **HIGH** | 🟠 | Lỗi ảnh hưởng đến chất lượng học tập đáng kể | Sai ngữ pháp nặng, logic sai, ví dụ không phù hợp |
| **MEDIUM** | 🟡 | Lỗi giảm trải nghiệm nhưng không block học tập | Layout lỗi, typo nhỏ, hình ảnh thiếu alt-text |
| **LOW** | 🟢 | Cải tiến nhỏ, không urgent | Suggestion về từ ngữ, cải thiện ví dụ, style |

### 6.2 Error Action & SLA Table

| Severity | Error Type | Action | Responsible | SLA | Escalation |
|---|---|---|---|:---:|---|
| 🔴 CRITICAL | Sai đáp án | Block + Unpublish ngay + Fix | Senior Dev + Subject Expert | **1 giờ** | VP Education trong 30 phút |
| 🔴 CRITICAL | Nội dung không phù hợp trẻ em | Remove + Crisis protocol | QA Lead + Content Team | **30 phút** | CEO trong 15 phút |
| 🔴 CRITICAL | Prompt injection / AI safety | Block + Security review | AI Safety Team | **30 phút** | CTO trong 15 phút |
| 🔴 CRITICAL | Copyright violation | Remove + Legal review | Legal + Content | **2 giờ** | Legal Counsel |
| 🟠 HIGH | Sai ngữ pháp gây hiểu lầm | Fix + Re-review | Content Team | **24 giờ** | QA Lead nếu quá 12h |
| 🟠 HIGH | Logic sai trong lý thuyết | Fix + Verify | Subject Expert | **24 giờ** | Senior Reviewer |
| 🟠 HIGH | Ví dụ văn hóa không phù hợp | Fix + Cultural review | Content + Culture Advisor | **24 giờ** | |
| 🟠 HIGH | Video audio không rõ | Re-process hoặc re-record | AV Team | **48 giờ** | |
| 🟡 MEDIUM | Layout lỗi trên mobile | Fix | FE Developer | **72 giờ** | |
| 🟡 MEDIUM | Typo trong nội dung | Fix | Content Team | **1 tuần** | Batch fix |
| 🟡 MEDIUM | Alt-text thiếu | Add | Content Team | **1 tuần** | |
| 🟢 LOW | Style suggestion | Backlog | Content Team | **Sprint** | Không |
| 🟢 LOW | Better example suggestion | Backlog | Content Team | **Sprint** | Không |

### 6.3 Critical Error Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│                  CRITICAL ERROR RESPONSE PROTOCOL                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  T+0:00  Error detected (auto or manual)                         │
│     ↓    Automatic flag in system → Status: BLOCKED              │
│                                                                   │
│  T+0:05  Notification to QA Lead + Content Lead                  │
│     ↓    Content unpublished / AI response blocked               │
│                                                                   │
│  T+0:15  Impact assessment                                        │
│     ↓    How many students affected?                              │
│          Was wrong content consumed?                              │
│                                                                   │
│  T+0:30  If students impacted: Parent notification drafted        │
│     ↓    Fix assigned to expert                                   │
│                                                                   │
│  T+1:00  Fix submitted for QA                                    │
│     ↓    Emergency QA review (abbreviated checklist)             │
│                                                                   │
│  T+1:30  Fixed content re-published                              │
│     ↓    Post-mortem scheduled                                   │
│                                                                   │
│  T+48h   Post-mortem completed                                    │
│          Prevention measures documented                           │
│          QA Standard updated if needed                            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Error Pattern Tracking

Mỗi error được lưu với metadata để phân tích pattern:

```
Error Record:
- error_id: Unique ID
- content_id: Content liên quan
- content_type: Loại nội dung
- severity: CRITICAL/HIGH/MEDIUM/LOW
- error_category: accuracy/language/safety/structure/pedagogy
- detected_by: auto/human/student/parent
- detected_at: timestamp
- resolved_at: timestamp
- root_cause: (sau post-mortem)
- prevention: (biện pháp ngăn chặn)
```

---

## 7. QA Dashboard & Reporting

### 7.1 Core Metrics

| Metric | Định nghĩa | Target | Alert Threshold |
|---|---|:---:|:---:|
| **Overall Pass Rate** | % content đạt ≥80 điểm QA | ≥90% | <80% |
| **First-Pass Rate** | % content pass ngay lần đầu | ≥75% | <60% |
| **Critical Error Rate** | CRITICAL errors / 1000 content items | <1 | >5 |
| **Mean QA Score** | Điểm QA trung bình | ≥85 | <80 |
| **Review Queue Age** | Thời gian chờ review trung bình | <24h | >48h |
| **SLA Compliance** | % issues fixed trong SLA | ≥95% | <85% |
| **Reviewer Throughput** | Items reviewed / reviewer / day | ≥15 | <8 |
| **Re-QA Rate** | % content phải QA lần 2+ | <15% | >25% |
| **Student Error Rate** | % câu trả lời sai do content lỗi | <0.1% | >0.5% |
| **Parent Complaints/QA** | Khiếu nại phụ huynh liên quan content | <0.5/1000 | >2/1000 |

### 7.2 Report Templates

#### Daily QA Snapshot

```
═══════════════════════════════════════════════════
    AvaB QA Daily Snapshot — {DATE}
═══════════════════════════════════════════════════

📊 VOLUME
  Items Submitted:        {N}
  Auto QA Completed:      {N} ({%})
  Manual Review Queue:    {N}
  Published Today:        {N}

✅ QUALITY
  Pass Rate:              {%}  [Target: ≥90%]
  Mean QA Score:          {X}  [Target: ≥85]
  First-Pass Rate:        {%}  [Target: ≥75%]

🚨 ERRORS
  Critical:               {N}  [Target: 0]
  High:                   {N}
  Medium:                 {N}
  Low:                    {N}

⏱️ SLA
  SLA Compliance:         {%}  [Target: ≥95%]
  Oldest Open Issue:      {H} hours
  Avg Resolution Time:    {H} hours

👥 REVIEWERS
  Active Today:           {N}
  Items/Reviewer:         {N}
  Top Performer:          {Name} ({N} items)

⚠️ ALERTS
  {List any metrics below threshold}

📈 vs Yesterday
  Pass Rate:    {+/-X%}
  Queue Size:   {+/-N}
  Errors:       {+/-N}
═══════════════════════════════════════════════════
```

#### Weekly QA Report

```
═══════════════════════════════════════════════════
    AvaB QA Weekly Report — Week {W}, {YEAR}
═══════════════════════════════════════════════════

EXECUTIVE SUMMARY
  {2-3 câu tóm tắt tuần}

VOLUME TREND (7 days)
  Mon: {N} items | Pass: {%}
  Tue: {N} items | Pass: {%}
  ...
  Total: {N} | Avg Pass Rate: {%}

ERROR ANALYSIS
  By Category:
    Accuracy:       {N} ({%})
    Language:       {N} ({%})
    Safety:         {N} ({%})
    Structure:      {N} ({%})
    Pedagogy:       {N} ({%})

  By Content Type:
    Lesson:         {N}
    Exercise:       {N}
    Video:          {N}
    AI Tutor:       {N}

TOP ISSUES THIS WEEK
  1. {Issue type}: {N} occurrences
  2. {Issue type}: {N} occurrences
  3. {Issue type}: {N} occurrences

IMPROVEMENT AREAS
  {Patterns identified, recommendations}

ACTIONS FOR NEXT WEEK
  □ {Action 1}
  □ {Action 2}
═══════════════════════════════════════════════════
```

### 7.3 Alert System

| Alert | Trigger | Channel | Recipient |
|---|---|---|---|
| 🔴 Critical Error Detected | Any CRITICAL error | Slack #qa-critical + SMS | QA Lead, Content Lead, CTO |
| 🟠 Pass Rate Drop | Daily pass rate <80% | Slack #qa-alerts | QA Lead, VP Education |
| 🟡 Queue Overflow | Review queue >48h old | Slack #qa-ops | QA Lead |
| 🟡 SLA Breach | Any SLA missed | Slack #qa-ops | Responsible team |
| 📊 Daily Digest | 6:00 PM daily | Email | QA Team, Management |
| 📈 Weekly Report | Monday 9:00 AM | Email + Slack | All stakeholders |

---

## 8. JSON Schema cho QA Report

### 8.1 Full QA Report Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://avab.edu.vn/schemas/qa-report/v1.0",
  "title": "AvaB QA Report",
  "description": "Quality Assurance Report for AvaB learning content",
  "type": "object",
  "required": [
    "report_id",
    "content_id",
    "content_type",
    "qa_version",
    "auto_qa",
    "status",
    "created_at"
  ],
  "properties": {
    "report_id": {
      "type": "string",
      "pattern": "^QAR-[0-9]{8}-[A-Z0-9]{6}$",
      "description": "Unique QA Report ID. Format: QAR-YYYYMMDD-XXXXXX",
      "example": "QAR-20260704-A1B2C3"
    },
    "content_id": {
      "type": "string",
      "description": "ID of the content being reviewed"
    },
    "content_type": {
      "type": "string",
      "enum": ["lesson", "theory", "exercise", "homework", "video", "ai_tutor", "assessment", "illustration"],
      "description": "Type of content"
    },
    "content_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version of content"
    },
    "qa_version": {
      "type": "string",
      "description": "QA Standard version used",
      "const": "1.0.0"
    },
    "auto_qa": {
      "type": "object",
      "required": ["score", "status", "checks", "completed_at"],
      "properties": {
        "score": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "description": "Auto QA score 0-100"
        },
        "status": {
          "type": "string",
          "enum": ["pass", "review", "fail"],
          "description": "Auto QA outcome"
        },
        "completed_at": {
          "type": "string",
          "format": "date-time"
        },
        "engine_version": {
          "type": "string",
          "description": "Auto QA engine version"
        },
        "checks": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/AutoCheck"
          }
        }
      }
    },
    "manual_qa": {
      "type": "object",
      "description": "Present only when manual review was performed",
      "required": ["reviewer_id", "score", "status", "completed_at", "checklist_results"],
      "properties": {
        "reviewer_id": {
          "type": "string",
          "description": "Reviewer employee ID"
        },
        "reviewer_name": {
          "type": "string"
        },
        "reviewer_level": {
          "type": "string",
          "enum": ["qa_reviewer", "senior_reviewer", "subject_expert", "ai_safety_reviewer"]
        },
        "score": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "status": {
          "type": "string",
          "enum": ["pass", "review", "fail", "reject"]
        },
        "started_at": {
          "type": "string",
          "format": "date-time"
        },
        "completed_at": {
          "type": "string",
          "format": "date-time"
        },
        "time_spent_minutes": {
          "type": "integer",
          "minimum": 0
        },
        "checklist_results": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ChecklistItem"
          }
        },
        "reviewer_notes": {
          "type": "string",
          "maxLength": 2000
        }
      }
    },
    "final_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Weighted final score (auto + manual if available)"
    },
    "status": {
      "type": "string",
      "enum": ["pending_auto", "pending_manual", "pass", "review", "fail", "reject", "blocked"],
      "description": "Overall QA status"
    },
    "issues": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/QAIssue"
      }
    },
    "must_fails": {
      "type": "array",
      "description": "List of MUST criteria that failed (triggers reject regardless of score)",
      "items": {
        "type": "string",
        "description": "Criterion ID e.g. C01, E13"
      }
    },
    "publishing_gate": {
      "type": "object",
      "properties": {
        "approved": {
          "type": "boolean"
        },
        "approved_by": {
          "type": "string"
        },
        "approved_at": {
          "type": "string",
          "format": "date-time"
        },
        "blocked_reason": {
          "type": "string"
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "grade": {
          "type": "integer",
          "minimum": 1,
          "maximum": 12
        },
        "subject": {
          "type": "string"
        },
        "chapter": {
          "type": "string"
        },
        "difficulty": {
          "type": "integer",
          "minimum": 1,
          "maximum": 5
        },
        "language": {
          "type": "string",
          "default": "vi"
        }
      }
    }
  },
  "definitions": {
    "AutoCheck": {
      "type": "object",
      "required": ["check_id", "check_name", "result", "score"],
      "properties": {
        "check_id": {
          "type": "string",
          "description": "e.g. AQ-01, AQ-02"
        },
        "check_name": {
          "type": "string"
        },
        "result": {
          "type": "string",
          "enum": ["pass", "fail", "warning", "skip"]
        },
        "score": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "details": {
          "type": "object",
          "description": "Check-specific details"
        },
        "duration_ms": {
          "type": "integer"
        }
      }
    },
    "ChecklistItem": {
      "type": "object",
      "required": ["item_id", "result"],
      "properties": {
        "item_id": {
          "type": "string",
          "description": "e.g. L01, E13, T01"
        },
        "criterion_type": {
          "type": "string",
          "enum": ["MUST", "SHOULD", "MAY"]
        },
        "result": {
          "type": "string",
          "enum": ["pass", "fail", "na"]
        },
        "note": {
          "type": "string"
        }
      }
    },
    "QAIssue": {
      "type": "object",
      "required": ["issue_id", "severity", "category", "description", "status"],
      "properties": {
        "issue_id": {
          "type": "string",
          "pattern": "^ISS-[0-9]{8}-[A-Z0-9]{4}$"
        },
        "severity": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"]
        },
        "category": {
          "type": "string",
          "enum": ["accuracy", "language", "safety", "structure", "pedagogy", "accessibility", "technical"]
        },
        "criterion_id": {
          "type": "string",
          "description": "Related criterion, e.g. C01"
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "location": {
          "type": "object",
          "properties": {
            "section": {"type": "string"},
            "item_index": {"type": "integer"},
            "field": {"type": "string"},
            "text_excerpt": {"type": "string"}
          }
        },
        "suggested_fix": {
          "type": "string"
        },
        "status": {
          "type": "string",
          "enum": ["open", "in_progress", "resolved", "wont_fix", "duplicate"]
        },
        "assigned_to": {
          "type": "string"
        },
        "resolved_at": {
          "type": "string",
          "format": "date-time"
        },
        "sla_deadline": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

### 8.2 QA Report Sample — Exercise

```json
{
  "report_id": "QAR-20260704-A1B2C3",
  "content_id": "EXE-MATH3-0042",
  "content_type": "exercise",
  "content_version": "1.0.0",
  "qa_version": "1.0.0",
  "auto_qa": {
    "score": 91,
    "status": "pass",
    "completed_at": "2026-07-04T02:00:00+07:00",
    "engine_version": "auto-qa-v2.3.1",
    "checks": [
      {
        "check_id": "AQ-01",
        "check_name": "Schema Validation",
        "result": "pass",
        "score": 100,
        "duration_ms": 45
      },
      {
        "check_id": "AQ-02",
        "check_name": "Spell Check",
        "result": "pass",
        "score": 100,
        "details": {"typos_found": 0},
        "duration_ms": 2100
      },
      {
        "check_id": "AQ-05",
        "check_name": "Answer Verification",
        "result": "pass",
        "score": 100,
        "details": {
          "questions_checked": 8,
          "correct": 8,
          "failed": 0
        },
        "duration_ms": 3400
      },
      {
        "check_id": "AQ-06",
        "check_name": "Readability Score",
        "result": "pass",
        "score": 85,
        "details": {
          "ari_score": 5.2,
          "target_grade": 3,
          "computed_grade": "3-4",
          "within_tolerance": true
        },
        "duration_ms": 1800
      }
    ]
  },
  "final_score": 91,
  "status": "pass",
  "issues": [],
  "must_fails": [],
  "publishing_gate": {
    "approved": true,
    "approved_by": "auto-system",
    "approved_at": "2026-07-04T02:00:15+07:00"
  },
  "created_at": "2026-07-04T02:00:00+07:00",
  "updated_at": "2026-07-04T02:00:15+07:00",
  "metadata": {
    "grade": 3,
    "subject": "math",
    "chapter": "multiplication",
    "difficulty": 2,
    "language": "vi"
  }
}
```

---

## 9. Database Design

### 9.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  content_items  │────<│    qa_reports        │>────│   qa_reviewers  │
│─────────────────│     │──────────────────────│     │─────────────────│
│ content_id (PK) │     │ report_id (PK)       │     │ reviewer_id (PK)│
│ content_type    │     │ content_id (FK)      │     │ name            │
│ title           │     │ reviewer_id (FK) NULL│     │ level           │
│ grade           │     │ auto_score           │     │ subjects[]      │
│ subject         │     │ manual_score         │     │ active          │
│ status          │     │ final_score          │     │ created_at      │
│ current_version │     │ status               │     └─────────────────┘
│ created_at      │     │ qa_version           │
│ updated_at      │     │ created_at           │
└─────────────────┘     │ updated_at           │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                      │
    ┌─────────▼────────┐  ┌───────▼──────────┐  ┌───────▼──────────┐
    │    qa_issues     │  │ qa_checklist_    │  │  qa_auto_checks  │
    │──────────────────│  │ results          │  │──────────────────│
    │ issue_id (PK)    │  │──────────────────│  │ check_id (PK)    │
    │ report_id (FK)   │  │ result_id (PK)   │  │ report_id (FK)   │
    │ severity         │  │ report_id (FK)   │  │ check_code       │
    │ category         │  │ item_id (FK)     │  │ check_name       │
    │ description      │  │ result           │  │ result           │
    │ location_json    │  │ reviewer_note    │  │ score            │
    │ suggested_fix    │  │ created_at       │  │ details_json     │
    │ status           │  └──────────────────┘  │ duration_ms      │
    │ assigned_to      │                         │ created_at       │
    │ sla_deadline     │  ┌──────────────────┐   └──────────────────┘
    │ resolved_at      │  │ qa_checklist_    │
    │ created_at       │  │ items            │
    └──────────────────┘  │──────────────────│
                          │ item_id (PK)     │
    ┌──────────────────┐  │ content_type     │
    │  content_version │  │ item_code        │
    │  _history        │  │ description      │
    │──────────────────│  │ criterion_type   │
    │ history_id (PK)  │  │ weight           │
    │ content_id (FK)  │  │ active           │
    │ version          │  └──────────────────┘
    │ qa_report_id (FK)│
    │ change_summary   │
    │ changed_by       │
    │ created_at       │
    └──────────────────┘
```

### 9.2 DDL — PostgreSQL

```sql
-- ============================================================
-- AvaB QA Database Schema v1.0
-- ============================================================

-- Enum types
CREATE TYPE content_type_enum AS ENUM (
    'lesson', 'theory', 'exercise', 'homework',
    'video', 'ai_tutor', 'assessment', 'illustration'
);

CREATE TYPE qa_status_enum AS ENUM (
    'pending_auto', 'pending_manual', 'pass',
    'review', 'fail', 'reject', 'blocked'
);

CREATE TYPE severity_enum AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TYPE issue_status_enum AS ENUM (
    'open', 'in_progress', 'resolved', 'wont_fix', 'duplicate'
);

CREATE TYPE reviewer_level_enum AS ENUM (
    'qa_reviewer', 'senior_reviewer',
    'subject_expert', 'ai_safety_reviewer'
);

CREATE TYPE criterion_type_enum AS ENUM ('MUST', 'SHOULD', 'MAY');

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_reviewers
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_reviewers (
    reviewer_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id         VARCHAR(20) UNIQUE NOT NULL,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    level               reviewer_level_enum NOT NULL,
    subjects            TEXT[],                          -- e.g. {'math', 'science'}
    max_daily_items     INTEGER DEFAULT 15,
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_checklist_items
-- Master list of all checklist items
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_checklist_items (
    item_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code           VARCHAR(10) UNIQUE NOT NULL,     -- e.g. 'L01', 'E13', 'T01'
    content_type        content_type_enum NOT NULL,
    category            VARCHAR(50) NOT NULL,            -- e.g. 'metadata', 'accuracy'
    description         TEXT NOT NULL,
    criterion_type      criterion_type_enum NOT NULL,
    weight              NUMERIC(5,2) DEFAULT 1.0,
    active              BOOLEAN DEFAULT TRUE,
    version             VARCHAR(10) DEFAULT '1.0',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_reports
-- Main QA report per content item per review cycle
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_reports (
    report_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id          VARCHAR(100) NOT NULL,
    content_type        content_type_enum NOT NULL,
    content_version     VARCHAR(20),
    qa_standard_version VARCHAR(10) DEFAULT '1.0.0',

    -- Auto QA results
    auto_score          NUMERIC(5,2),
    auto_status         VARCHAR(20),                     -- pass/review/fail
    auto_completed_at   TIMESTAMPTZ,
    auto_engine_version VARCHAR(20),

    -- Manual QA results (nullable — may not have manual review)
    reviewer_id         UUID REFERENCES qa_reviewers(reviewer_id),
    manual_score        NUMERIC(5,2),
    manual_status       VARCHAR(20),
    manual_started_at   TIMESTAMPTZ,
    manual_completed_at TIMESTAMPTZ,
    time_spent_minutes  INTEGER,
    reviewer_notes      TEXT,

    -- Final outcome
    final_score         NUMERIC(5,2),
    status              qa_status_enum DEFAULT 'pending_auto',
    must_fails          TEXT[],                          -- criterion codes that failed MUST

    -- Publishing gate
    publish_approved    BOOLEAN DEFAULT FALSE,
    publish_approved_by VARCHAR(100),
    publish_approved_at TIMESTAMPTZ,
    publish_blocked_reason TEXT,

    -- Metadata
    grade               SMALLINT CHECK (grade BETWEEN 1 AND 12),
    subject             VARCHAR(50),
    language            VARCHAR(10) DEFAULT 'vi',

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qa_reports_content ON qa_reports(content_id);
CREATE INDEX idx_qa_reports_status ON qa_reports(status);
CREATE INDEX idx_qa_reports_created ON qa_reports(created_at DESC);
CREATE INDEX idx_qa_reports_reviewer ON qa_reports(reviewer_id) WHERE reviewer_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_auto_checks
-- Individual auto QA check results
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_auto_checks (
    check_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES qa_reports(report_id) ON DELETE CASCADE,
    check_code          VARCHAR(10) NOT NULL,            -- e.g. 'AQ-01'
    check_name          VARCHAR(100) NOT NULL,
    result              VARCHAR(20) NOT NULL,            -- pass/fail/warning/skip
    score               NUMERIC(5,2),
    details             JSONB,                           -- check-specific details
    duration_ms         INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auto_checks_report ON qa_auto_checks(report_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_checklist_results
-- Manual checklist item results per report
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_checklist_results (
    result_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES qa_reports(report_id) ON DELETE CASCADE,
    item_code           VARCHAR(10) NOT NULL,            -- references qa_checklist_items
    criterion_type      criterion_type_enum NOT NULL,
    result              VARCHAR(10) NOT NULL,            -- pass/fail/na
    reviewer_note       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_results_report ON qa_checklist_results(report_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: qa_issues
-- Issues found during QA
-- ────────────────────────────────────────────────────────────
CREATE TABLE qa_issues (
    issue_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES qa_reports(report_id),
    content_id          VARCHAR(100) NOT NULL,
    severity            severity_enum NOT NULL,
    category            VARCHAR(50) NOT NULL,
    criterion_id        VARCHAR(10),
    description         TEXT NOT NULL,
    location_data       JSONB,                           -- {section, item_index, field, text_excerpt}
    suggested_fix       TEXT,
    status              issue_status_enum DEFAULT 'open',
    assigned_to         UUID REFERENCES qa_reviewers(reviewer_id),
    sla_deadline        TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    resolved_by         UUID REFERENCES qa_reviewers(reviewer_id),
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issues_report ON qa_issues(report_id);
CREATE INDEX idx_issues_content ON qa_issues(content_id);
CREATE INDEX idx_issues_severity ON qa_issues(severity, status);
CREATE INDEX idx_issues_sla ON qa_issues(sla_deadline) WHERE status = 'open';

-- ────────────────────────────────────────────────────────────
-- TABLE: content_version_history
-- Track QA per version of content
-- ────────────────────────────────────────────────────────────
CREATE TABLE content_version_history (
    history_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id          VARCHAR(100) NOT NULL,
    version             VARCHAR(20) NOT NULL,
    qa_report_id        UUID REFERENCES qa_reports(report_id),
    qa_status           qa_status_enum,
    change_summary      TEXT,
    change_type         VARCHAR(50),                     -- initial/fix/improvement/major_revision
    changed_by          VARCHAR(100),
    published_at        TIMESTAMPTZ,
    deprecated_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, version)
);

-- ────────────────────────────────────────────────────────────
-- VIEW: qa_dashboard_metrics
-- Real-time metrics for dashboard
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW qa_dashboard_metrics AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    content_type,
    COUNT(*) AS total_reports,
    COUNT(*) FILTER (WHERE status = 'pass') AS passed,
    COUNT(*) FILTER (WHERE status IN ('fail','reject')) AS failed,
    COUNT(*) FILTER (WHERE status = 'review') AS in_review,
    ROUND(AVG(final_score), 2) AS avg_score,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'pass') / NULLIF(COUNT(*), 0),
        2
    ) AS pass_rate_pct
FROM qa_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), content_type
ORDER BY date DESC, content_type;

-- ────────────────────────────────────────────────────────────
-- VIEW: open_sla_violations
-- Issues past their SLA deadline
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW open_sla_violations AS
SELECT
    i.issue_id,
    i.content_id,
    i.severity,
    i.category,
    i.description,
    i.sla_deadline,
    EXTRACT(EPOCH FROM (NOW() - i.sla_deadline))/3600 AS hours_overdue,
    r.name AS assigned_to_name
FROM qa_issues i
LEFT JOIN qa_reviewers r ON i.assigned_to = r.reviewer_id
WHERE i.status IN ('open', 'in_progress')
  AND i.sla_deadline < NOW()
ORDER BY i.severity, i.sla_deadline;
```

---

## 10. Admin UI Design

### 10.1 QA Admin Interface — Screen Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      AvaB QA Admin Portal                        │
├─────────────┬───────────────────────────────────────────────────┤
│ 🏠 Dashboard│  📋 Queue  │  🔍 Review  │  🐛 Issues  │  📊 Reports│
└─────────────┴───────────────────────────────────────────────────┘
```

### 10.2 Dashboard Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 QA DASHBOARD                    [Today ▼]    🔄 Last updated: 2s │
├─────────────────────┬───────────────┬──────────────┬────────────────┤
│  Pass Rate          │  In Queue     │  Open Issues │  Avg QA Score  │
│                     │               │              │                │
│     92.3%           │      47       │  🔴 2  🟠 8  │     86.4       │
│  ▲ +1.2% vs yday    │  ⏱ Oldest 6h │  🟡 15 🟢 23│  ▲ +0.8        │
├─────────────────────┴───────────────┴──────────────┴────────────────┤
│  Pass Rate Trend (7 days)                                            │
│  100% ┤                                                              │
│   90% ┤  ████  ████  ████  ████  ████  ████  ████                   │
│   80% ┤  ████  ████  ████  ████  ████  ████  ████                   │
│   70% ┤                                                              │
│       └─────────────────────────────────────────────                 │
│         Mon    Tue    Wed    Thu    Fri    Sat    Sun                 │
├──────────────────────────┬──────────────────────────────────────────┤
│  By Content Type         │  Recent Critical Issues                   │
│  Lesson    ████████ 94%  │  🔴 EXE-MATH3-0041: Wrong answer Q3      │
│  Exercise  █████████ 95% │     → Fixed 2h ago by @nguyen.van.a      │
│  Theory    ███████ 89%   │  🔴 VID-SCI5-0012: Copyright concern      │
│  Video     ██████ 85%    │     → Under review by Legal              │
│  AI Tutor  ████████ 91%  │                                          │
│  Assessment████████ 93%  │  [View all issues →]                      │
└──────────────────────────┴──────────────────────────────────────────┘
```

### 10.3 QA Queue Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 REVIEW QUEUE                               [Filter ▼] [Assign]  │
├──────┬──────────────┬──────────┬───────┬───────┬────────┬───────────┤
│ Pri  │ Content ID   │ Type     │ Grade │Score  │ Age    │ Action    │
├──────┼──────────────┼──────────┼───────┼───────┼────────┼───────────┤
│ 🔴   │ VID-SCI5-012 │ Video    │  5    │ 68    │ 26h    │ [Review]  │
│ 🟠   │ LES-MATH3-89 │ Lesson   │  3    │ 74    │ 12h    │ [Review]  │
│ 🟠   │ EXE-ENG4-034 │ Exercise │  4    │ 71    │  8h    │ [Review]  │
│ 🟡   │ THR-SCI6-021 │ Theory   │  6    │ 63    │  4h    │ [Review]  │
│ 🟡   │ HWK-MATH5-18 │ Homework │  5    │ 77    │  3h    │ [Review]  │
│ ...  │ ...          │ ...      │ ...   │ ...   │ ...    │ ...       │
├──────┴──────────────┴──────────┴───────┴───────┴────────┴───────────┤
│  Showing 47 items  [← Prev] [1] [2] [3] [Next →]   [Bulk Assign ▼] │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.4 QA Reviewer Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 REVIEWING: EXE-MATH3-0089                        [Save] [Submit]│
├─────────────────────────┬───────────────────────────────────────────┤
│  AUTO QA SUMMARY        │  MANUAL CHECKLIST                         │
│  Score: 74 → REVIEW     │                                           │
│                         │  ┌─ QUESTION QUALITY ────────────────────┐│
│  ✅ Schema: Pass         │  │ E01 Câu hỏi rõ ràng?    ✅ ⚠️ ❌ N/A ││
│  ✅ Spell Check: Pass    │  │ E02 Câu hỏi ngắn gọn?   ✅ ⚠️ ❌ N/A ││
│  ⚠️ Readability: 67      │  │ E03 Ngôn ngữ phù hợp?   ✅ ⚠️ ❌ N/A ││
│  ✅ Duplicate: 8%        │  │ ...                                   ││
│  ⚠️ Answer V.: Warning   │  └───────────────────────────────────────┘│
│    Q4: Possible ambiguity│                                           │
│                         │  ┌─ ANSWER & EXPLANATION ─────────────────┐│
│  [View full auto report] │  │ E19 Đáp án verified?   ✅ ⚠️ ❌ N/A  ││
│                         │  │ E20 Giải thích đầy đủ? ✅ ⚠️ ❌ N/A  ││
│  CONTENT PREVIEW        │  │ ...                                   ││
│  ┌─────────────────────┐│  └───────────────────────────────────────┘│
│  │ Q1: 3 × 4 = ?       ││                                           │
│  │ A) 7  B) 12  C) 14  ││  ISSUES FOUND                             │
│  │ Đ/A: B ✅            ││  [+ Add Issue]                            │
│  │                     ││  🟡 E20: Explanation for Q4 too brief      │
│  │ Q4: Tính 15 ÷ 3 = ? ││     [Edit] [Delete]                       │
│  │ Lưu ý: 15/3 là gì?  ││                                           │
│  │ A) 4  B) 5  C) 6    ││  REVIEWER NOTES                           │
│  │ Đ/A: B              ││  ┌──────────────────────────────────────┐ ││
│  │ ⚠️ Ambiguous phrasing││  │ Q4 phrasing is confusing. "Lưu ý"   │ ││
│  └─────────────────────┘│  │ makes it seem like a note, not Q.   │ ││
│                         │  └──────────────────────────────────────┘ ││
├─────────────────────────┴───────────────────────────────────────────┤
│ Final Decision: [✅ PASS]  [⚠️ REVIEW — send back] [❌ REJECT]       │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.5 Issue Tracker Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  🐛 ISSUE TRACKER                    [Filter: All ▼] [Export CSV]   │
│  ┌─ Quick Filters ──────────────────────────────────────────────────┐│
│  │ 🔴 Critical: 2  🟠 High: 8  🟡 Medium: 15  🟢 Low: 23  SLA ⚠️:3 ││
│  └──────────────────────────────────────────────────────────────────┘│
├──────────┬────────┬──────────┬──────────────────────┬──────┬────────┤
│ Issue ID │ Sev    │ Category │ Description           │ SLA  │ Status │
├──────────┼────────┼──────────┼──────────────────────┼──────┼────────┤
│ ISS-001  │ 🔴     │ accuracy │ Wrong answer in Q3    │ 1h   │ Fixed  │
│ ISS-002  │ 🔴     │ safety   │ Copyright violation   │ 2h   │ Open ⚠️│
│ ISS-003  │ 🟠     │ language │ Grammar error para 2  │ 24h  │ In Prog│
│ ISS-004  │ 🟡     │ access.  │ Missing alt-text img  │ 72h  │ Open   │
└──────────┴────────┴──────────┴──────────────────────┴──────┴────────┘
```

### 10.6 Bulk QA Actions

Các action có thể thực hiện hàng loạt:

| Action | Điều kiện | Tác động |
|---|---|---|
| **Bulk Assign** | Chọn nhiều items trong queue | Gán cho reviewer |
| **Bulk Auto Re-QA** | Items đã fix xong | Chạy lại auto QA |
| **Bulk Approve** | Items có score 80-89, không có MUST fail | Pass không cần manual |
| **Batch Typo Fix** | LOW severity issues | Mark resolved sau batch |
| **Emergency Block** | Critical issue detected | Block tất cả version của content |
| **Export Report** | Chọn date range | CSV/PDF report |

---

## 11. Integration Points

### 11.1 Integration Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     AvaB QA Integration Map                       │
├────────────────────┬─────────────────────────────────────────────┤
│   UPSTREAM         │              QA ENGINE                       │
│                    │         ┌──────────────────┐                │
│  Content Generator │───────>│   Auto QA        │                │
│  (AI + Human)      │  Push   │   (Triggered     │                │
│                    │  Hook   │    on submit)     │                │
│  Content Editor    │───────>│                  │                │
│  (CMS)             │  Webhook│   ↓              │                │
│                    │         │  Human QA Queue   │                │
│                    │         │  (if needed)      │                │
│                    │         └────────┬─────────┘                │
│                    │                  │                           │
├────────────────────┴──────────────────┼───────────────────────────┤
│   DOWNSTREAM                          ↓                           │
│                              ┌─────────────────┐                 │
│                              │ Publishing Gate  │                 │
│  LMS / Student App <─────── │ QA Score ≥ 80   │                 │
│  (Only gets content         │ No MUST fails    │                 │
│   that passes QA)           └────────┬────────┘                 │
│                                      │                           │
│  A2PLM Analytics    <─────────────── │ Published content         │
│  (Monitors errors,                   │                           │
│   feeds back to QA)                  │                           │
│                                      ↓                           │
│  Notification System <─── QA Reports & Alerts                    │
│  (Slack, Email)                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 API Endpoints

```http
### Trigger Auto QA
POST /api/qa/auto
Content-Type: application/json
{
  "content_id": "EXE-MATH3-0089",
  "content_type": "exercise",
  "content_data": { ... }
}
→ 202 Accepted: { "report_id": "...", "status": "processing" }

### Get QA Report
GET /api/qa/reports/{report_id}
→ 200 OK: Full QAReport JSON

### Submit Manual QA
POST /api/qa/reports/{report_id}/manual
Authorization: Bearer {reviewer_token}
Content-Type: application/json
{
  "checklist_results": [...],
  "reviewer_notes": "...",
  "decision": "pass|review|fail"
}
→ 200 OK: Updated QAReport

### Check Publishing Gate
GET /api/qa/gate/{content_id}
→ 200 OK: { "can_publish": true/false, "qa_score": 92, "report_id": "..." }

### Report Issue
POST /api/qa/issues
{
  "report_id": "...",
  "severity": "high",
  "category": "accuracy",
  "description": "...",
  "suggested_fix": "..."
}
→ 201 Created: { "issue_id": "..." }

### Get Queue
GET /api/qa/queue?type=exercise&min_age_hours=2&limit=20
→ 200 OK: Paginated queue list

### Dashboard Metrics
GET /api/qa/metrics?period=7d&type=lesson
→ 200 OK: Metrics object
```

### 11.3 Content Generator → QA Integration

```python
# Pseudo-code: Content generator triggers QA on completion

class ContentGenerationPipeline:
    def on_content_generated(self, content: Content):
        # 1. Submit to QA
        qa_response = qa_api.trigger_auto(
            content_id=content.id,
            content_type=content.type,
            content_data=content.to_dict()
        )
        
        # 2. Update content status
        content.status = "qa_in_progress"
        content.qa_report_id = qa_response.report_id
        content.save()
        
        # 3. Wait for QA webhook (async)
        # QA engine calls back on completion
```

### 11.4 A2PLM Feedback Loop

```
Student Learning Data (A2PLM)
         ↓
Error Pattern Analysis
  • Which questions have >40% wrong rate?
  • Are errors consistent (same wrong answer)?
  • Correlation with specific content items?
         ↓
QA Feedback Signal
  • Flag content for re-review if error rate > threshold
  • Auto-create MEDIUM issue: "High student error rate"
  • Feed into next QA cycle as additional signal
         ↓
Content Improvement
  • Clearer wording
  • Better distractors
  • More examples in theory
         ↓
Re-QA → Republish
```

### 11.5 Publishing Gate Logic

```python
def can_publish(content_id: str) -> PublishDecision:
    report = get_latest_qa_report(content_id)
    
    if not report:
        return PublishDecision(allowed=False, reason="No QA report found")
    
    if report.status in ['pending_auto', 'pending_manual']:
        return PublishDecision(allowed=False, reason="QA in progress")
    
    if report.must_fails:
        return PublishDecision(
            allowed=False,
            reason=f"MUST criteria failed: {report.must_fails}"
        )
    
    if report.final_score < 60:
        return PublishDecision(allowed=False, reason="Score too low (< 60)")
    
    if 60 <= report.final_score < 80:
        if not report.manual_qa or report.manual_status != 'pass':
            return PublishDecision(
                allowed=False,
                reason="Score 60-79: Manual review required"
            )
    
    # Check no open CRITICAL or HIGH issues
    open_critical = get_open_issues(content_id, severity=['critical', 'high'])
    if open_critical:
        return PublishDecision(
            allowed=False,
            reason=f"{len(open_critical)} unresolved critical/high issues"
        )
    
    return PublishDecision(
        allowed=True,
        qa_score=report.final_score,
        report_id=report.report_id
    )
```

---

## 12. Continuous Improvement

### 12.1 QA Retrospective — Monthly

```
MONTHLY QA RETROSPECTIVE TEMPLATE
Month: ____________  Facilitator: ____________

SECTION 1: METRICS REVIEW (30 min)
  □ Pass rate trend vs previous month
  □ Error categories — what types dominated?
  □ SLA compliance rate
  □ Reviewer performance vs targets
  □ Top 5 content types with most issues

SECTION 2: ERROR PATTERN ANALYSIS (30 min)
  □ Are there recurring error types?
  □ Any new error categories not in current standard?
  □ Which criteria have most failures?
  □ Auto QA false positive/negative rate

SECTION 3: PROCESS REVIEW (20 min)
  □ What's working well?
  □ What's slowing down the process?
  □ Reviewer feedback on checklists
  □ Any tool improvements needed?

SECTION 4: STANDARD UPDATES (20 min)
  □ New criteria to add?
  □ Criteria to retire or adjust?
  □ SLA adjustments needed?
  □ Scoring weight adjustments?

SECTION 5: ACTION ITEMS
  □ [Action] → [Owner] → [Due date]
  □ ...
```

### 12.2 QA Standard Versioning

| Version | Change Type | Trigger | Approval Required |
|---|---|---|---|
| **Major** (X.0.0) | Scoring overhaul, new content types, major criteria changes | Annual review or major product change | QA Lead + VP Education + CTO |
| **Minor** (1.X.0) | New criteria, SLA adjustments, scoring weight changes | Monthly retrospective findings | QA Lead + VP Education |
| **Patch** (1.0.X) | Typo fixes, clarifications, example updates | As needed | QA Lead |

#### Version Change Log

| Version | Date | Changes | Author |
|---|---|---|---|
| 1.0.0 | 2026-07-04 | Initial release | AvaB QA Team |

### 12.3 Criteria Update Protocol

Khi thêm/sửa tiêu chí:

```
1. Đề xuất → Ghi vào QA Backlog với rationale
2. Review trong Monthly Retro
3. Impact assessment: bao nhiêu nội dung bị ảnh hưởng?
4. Vote: ≥2/3 QA team approve
5. Draft new criteria text
6. Pilot với 50 nội dung (không block publish)
7. Review kết quả pilot
8. Approve → Add vào standard
9. Update version number
10. Re-QA nội dung hiện có nếu MUST criteria mới
```

### 12.4 Reviewer Training & Calibration

| Activity | Tần suất | Mục tiêu | Metric |
|---|---|---|---|
| New reviewer onboarding | Khi có reviewer mới | Đạt ≥85% alignment với senior | Alignment score |
| Calibration session | Mỗi 2 tuần | Giữ inter-rater reliability cao | Cohen's kappa ≥0.8 |
| Blind double-review | 5% of content, monthly | Detect reviewer drift | Agreement rate ≥85% |
| Score normalization | Monthly | Loại bias reviewer quá dễ/khó | Z-score analysis |
| Training update | Khi standard update | Reviewer hiểu criteria mới | Post-training quiz ≥90% |

### 12.5 Escalation to Standard Update

```
Trigger conditions for Standard update:
  □ Same error type appears >3 times in 1 month
  □ A2PLM shows systematic issue with specific content pattern
  □ Parent complaints about specific content type
  □ New regulatory/curriculum requirement
  □ New content type launched
  □ Auto QA miss rate >5% on a specific check
```

---

## 13. Appendix

### 13.1 Glossary

| Term | Định nghĩa |
|---|---|
| **Auto QA** | Quá trình kiểm định tự động bằng AI/rule-based engine |
| **Manual QA** | Quá trình review thủ công bởi reviewer con người |
| **MUST** | Tiêu chí bắt buộc — vi phạm dẫn đến reject |
| **SHOULD** | Tiêu chí khuyến nghị — vi phạm trừ điểm nhưng không block |
| **MAY** | Tiêu chí tùy chọn — cải thiện trải nghiệm |
| **Publishing Gate** | Cơ chế chặn publish nếu QA chưa pass |
| **SLA** | Service Level Agreement — cam kết thời gian xử lý |
| **MUST fail** | Khi tiêu chí MUST bị vi phạm → content bị reject |
| **Scaffolding** | Kỹ thuật hỗ trợ học sinh bước-qua-bước |
| **Bloom's Taxonomy** | Phân cấp mục tiêu nhận thức trong giáo dục |
| **ARI** | AvaB Readability Index — chỉ số đọc hiểu adapted cho VN |
| **Inter-rater reliability** | Mức độ đồng thuận giữa các reviewer độc lập |
| **Cohen's kappa** | Thước đo thống kê inter-rater agreement |
| **A2PLM** | AvaB Adaptive Personalized Learning Management |
| **Distractor** | Các lựa chọn sai trong câu hỏi Multiple Choice |

### 13.2 Bloom's Taxonomy Reference

| Level | Tiếng Việt | Động từ mẫu | Áp dụng cho |
|---|---|---|---|
| 1. Remember | Ghi nhớ | Liệt kê, nhận biết, kể tên | Exercise Easy |
| 2. Understand | Hiểu | Giải thích, tóm tắt, mô tả | Exercise Easy-Medium |
| 3. Apply | Áp dụng | Tính toán, sử dụng, giải | Exercise Medium |
| 4. Analyze | Phân tích | So sánh, phân loại, tìm ra | Exercise Hard |
| 5. Evaluate | Đánh giá | Phán xét, lựa chọn, biện hộ | Assessment Hard |
| 6. Create | Sáng tạo | Thiết kế, tạo ra, đề xuất | Project/HW Hard |

### 13.3 Grade-Level Time Limits

| Grade | Theory max | Exercise total | Homework max | Video max |
|---|---|---|---|---|
| 1-2 | 100 từ | 5 câu / 10 phút | 10 phút | 4 phút |
| 3-4 | 200 từ | 8 câu / 15 phút | 15 phút | 6 phút |
| 5-6 | 300 từ | 10 câu / 20 phút | 20 phút | 8 phút |
| 7-9 | 450 từ | 12 câu / 25 phút | 30 phút | 10 phút |
| 10-12 | 600 từ | 15 câu / 35 phút | 45 phút | 12 phút |

### 13.4 Content Type ID Naming Convention

```
Format: {TYPE_CODE}-{SUBJECT_CODE}{GRADE}-{SEQUENCE}

TYPE_CODE:  LES=Lesson | THR=Theory | EXE=Exercise
            HWK=Homework | VID=Video | ASS=Assessment
            ILL=Illustration | ATR=AI Tutor Config

SUBJECT_CODE: MATH=Toán | SCI=Khoa học | ENG=Tiếng Anh
              VNS=Tiếng Việt | HIS=Lịch sử | GEO=Địa lý

GRADE: 1-12 (single digit, no padding)

SEQUENCE: 4-digit zero-padded number

Examples:
  LES-MATH3-0042  → Lesson, Math, Grade 3, #42
  EXE-ENG5-0109   → Exercise, English, Grade 5, #109
  VID-SCI6-0033   → Video, Science, Grade 6, #33
```

### 13.5 Quick Reference Card

```
╔════════════════════════════════════════════════════════════╗
║          AvaB QA QUICK REFERENCE — v1.0                    ║
╠════════════════════════════════════════════════════════════╣
║  SCORE THRESHOLDS                                          ║
║  ≥90 → Excellent (publish immediately)                     ║
║  80-89 → Pass (publish with minor review)                  ║
║  60-79 → Review (human QA required)                        ║
║  <60 → Fail (must fix and resubmit)                        ║
║  ANY MUST fail → Reject (regardless of score)              ║
╠════════════════════════════════════════════════════════════╣
║  SLA COMMITMENTS                                           ║
║  🔴 Critical: 30min-2h          🟠 High: 24h               ║
║  🟡 Medium: 72h                 🟢 Low: 1 week              ║
╠════════════════════════════════════════════════════════════╣
║  SCORING WEIGHTS                                           ║
║  Academic Integrity: 35%    Safety & Appropriate: 25%      ║
║  Language & Structure: 20%  Pedagogy: 15%                  ║
║  UX & Accessibility: 5%                                    ║
╠════════════════════════════════════════════════════════════╣
║  AUTO QA CHECKS (AQ-01 to AQ-10)                           ║
║  Schema | Spell | Grammar | Duplicate | Answer             ║
║  Readability | Image | CogLoad | Level | Terminology       ║
╠════════════════════════════════════════════════════════════╣
║  CRITICAL RULE: No MUST fail can be published.             ║
║  GOLDEN RULE: Every child deserves accurate,               ║
║               age-appropriate, engaging content.           ║
╚════════════════════════════════════════════════════════════╝
```

---

## Document Control

| Field | Value |
|---|---|
| Document Owner | AvaB QA Team |
| Review Cycle | Monthly (minor), Annual (major) |
| Next Scheduled Review | 2026-08-04 |
| Distribution | Internal — QA Team, Content Team, Engineering, Management |
| Related Documents | AvaB Curriculum Standard, AvaB Content Style Guide, AvaB Safety Policy |

---

*AvaB QA Standard v1.0 — Copyright © 2026 AvaB Education. Internal use only.*
*"Every child deserves accurate, age-appropriate, engaging content."*
