# AvaB Lesson Standard v1.0
**Chief Learning Experience Architect — AvaB Education System**
**Effective Date:** 2026-07-04 | **Review Cycle:** Annual | **Owner:** AvaB Curriculum Team

> "Every lesson is a carefully engineered experience — not a document." — AvaB Design Principle

---

## TABLE OF CONTENTS

1. [Lesson Metadata Standard](#1-lesson-metadata-standard)
2. [Lesson Structure Standard](#2-lesson-structure-standard)
3. [Learning Objective Standard](#3-learning-objective-standard)
4. [Theory Standard](#4-theory-standard)
5. [Example Standard](#5-example-standard)
6. [Exercise Standard](#6-exercise-standard)
7. [Homework Standard](#7-homework-standard)
8. [Illustration Standard](#8-illustration-standard)
9. [AI Tutor Standard](#9-ai-tutor-standard)
10. [Teacher Guide Standard](#10-teacher-guide-standard)
11. [Parent Note Standard](#11-parent-note-standard)
12. [Assessment Standard](#12-assessment-standard)
13. [QA Standard — Master Checklist](#13-qa-standard--master-checklist)
14. [JSON Data Model](#14-json-data-model)
15. [Database Design](#15-database-design)
16. [Admin UI Design](#16-admin-ui-design)
17. [Workflow Diagram](#17-workflow-diagram)

---

## PREAMBLE

### Vision
AvaB Lesson Standard (ALS v1.0) là hệ thống chuẩn duy nhất chi phối việc thiết kế, sản xuất, đánh giá và xuất bản mọi bài học trong hệ thống AvaB — từ Toán Tư Duy, Anh văn đến Tin học — cho trẻ 5–8 tuổi tại Việt Nam. Tài liệu này được thiết kế để ổn định trong ít nhất 10 năm và là nguồn tham chiếu duy nhất (Single Source of Truth) cho toàn đội ngũ: curriculum writers, developers, QA, designers, và AI engineers.

### Core Pedagogical Frameworks Integrated
| Framework | Ứng dụng chính |
|---|---|
| Cambridge Primary | Chuẩn năng lực đầu ra, curriculum alignment |
| Singapore Math | CPA (Concrete-Pictorial-Abstract), bar modeling |
| Beast Academy | Problem-solving mindset, puzzle-based learning |
| Common Core | Tiêu chuẩn đầu ra toán và ngôn ngữ |
| IB PYP | Learner profile, inquiry-based approach |
| Montessori | Self-paced learning, hands-on discovery |
| Bloom's Taxonomy | Phân cấp mục tiêu học tập (6 bậc) |
| SOLO Taxonomy | Đánh giá chất lượng tư duy học sinh |
| UDL | Universal Design for Learning — đa phương thức |
| Cognitive Load Theory | Kiểm soát tải nhận thức |
| LXD | Learning Experience Design — thiết kế hành trình học |
| HCI | Human-Computer Interaction — UX cho trẻ em |
| Child Psychology | Phát triển nhận thức Piaget, Vygotsky ZPD |
| Gamification | Điểm, huy hiệu, tiến trình, streak |
| A2PLM Model | AvaB Adaptive Personalized Learning Model |

### Subjects
| Code | Subject | Language | Age Range |
|---|---|---|---|
| MATH | Toán Tư Duy | Vietnamese | 5–8 tuổi (G1–G3) |
| ENG | Anh văn | English (+ VN) | 5–8 tuổi (G1–G3) |
| CS | Tin học / Lập trình | Vietnamese | 6–8 tuổi (G1–G3) |

### Document Conventions
- **MUST**: Bắt buộc 100% — vi phạm sẽ reject lesson
- **SHOULD**: Khuyến nghị mạnh — không có phải giải thích
- **MAY**: Tùy chọn theo context
- ⚠️ **Anti-pattern**: Cách làm sai, cần tránh
- ✅ **Best Practice**: Cách làm tốt nhất được kiểm chứng
- 🔍 **QA Gate**: Điểm kiểm tra bắt buộc trước khi publish

---

## 1. LESSON METADATA STANDARD

### 1.1 Lesson ID Format

```
[SUBJECT]-[GRADE]-[MODULE]-[SEQ]
```

| Segment | Format | Example | Rules |
|---|---|---|---|
| SUBJECT | 2–4 ký tự uppercase | MATH, ENG, CS | Chỉ các mã đã đăng ký |
| GRADE | G + số (1–9) | G1, G2, G3 | G1 = lớp 1 = ~6–7 tuổi |
| MODULE | 3 ký tự uppercase (abbreviation) | QLD, NUM, ALG | Phải có trong Module Registry |
| SEQ | 3 chữ số, zero-padded | 001, 023, 100 | Số thứ tự trong module |

**Examples:**
- `MATH-G2-QLD-003` → Toán G2, Module Quadrilateral, bài thứ 3
- `ENG-G1-PHO-012` → Anh văn G1, Module Phonics, bài thứ 12
- `CS-G2-ALG-005` → Tin học G2, Module Algorithm, bài thứ 5

**Naming Rules:**
- MUST: Lesson ID là duy nhất toàn hệ thống — không tái sử dụng dù đã archive
- MUST: Sau khi publish, Lesson ID không được thay đổi
- MUST: SEQ phải liên tục trong module, không bỏ số
- SHOULD: Module code phải có nghĩa (abbreviation của module name)

### 1.2 Module Registry

#### Mathematics (MATH)
| Code | Module Name | Grade Range |
|---|---|---|
| NUM | Numbers & Place Value | G1–G3 |
| OPS | Operations (+−×÷) | G1–G3 |
| FRC | Fractions | G2–G3 |
| GEO | Geometry | G1–G3 |
| QLD | Quadrilaterals & Shapes | G2–G3 |
| MSR | Measurement | G1–G3 |
| DAT | Data & Statistics | G2–G3 |
| PAT | Patterns & Algebra | G1–G3 |
| WRD | Word Problems | G1–G3 |
| LGC | Logic & Reasoning | G1–G3 |

#### English (ENG)
| Code | Module Name | Grade Range |
|---|---|---|
| PHO | Phonics | G1–G2 |
| VOC | Vocabulary | G1–G3 |
| RDG | Reading Comprehension | G1–G3 |
| WRT | Writing | G1–G3 |
| SPK | Speaking | G1–G3 |
| LST | Listening | G1–G3 |
| GRM | Grammar | G1–G3 |
| SNG | Songs & Rhymes | G1–G2 |
| STR | Storytelling | G1–G3 |

#### Computer Science (CS)
| Code | Module Name | Grade Range |
|---|---|---|
| ALG | Algorithms & Sequences | G1–G3 |
| LOG | Logical Thinking | G1–G3 |
| SCR | Scratch / Block Coding | G2–G3 |
| DAT | Data & Variables | G2–G3 |
| DEB | Debugging | G2–G3 |
| PRJ | Projects | G2–G3 |

### 1.3 Required Metadata Fields

| Field | Type | MUST/SHOULD/MAY | Description |
|---|---|---|---|
| `lessonId` | string | **MUST** | Định danh duy nhất |
| `title` | string | **MUST** | Tiêu đề bài học, max 80 ký tự |
| `titleEn` | string | **SHOULD** | Tiêu đề tiếng Anh |
| `subject` | enum | **MUST** | MATH / ENG / CS |
| `grade` | integer | **MUST** | 1–9 |
| `module` | string | **MUST** | Module code (xem Registry) |
| `sequence` | integer | **MUST** | Số thứ tự trong module |
| `version` | string | **MUST** | SemVer: "1.0.0" |
| `status` | enum | **MUST** | draft / review / approved / published / archived |
| `ageRange` | object | **MUST** | `{min: 5, max: 8}` |
| `estimatedDuration` | integer | **MUST** | Phút — total lesson time |
| `learningObjectives` | array | **MUST** | Min 1, max 5 objectives |
| `bloomsLevel` | enum | **MUST** | remember/understand/apply/analyze/evaluate/create |
| `soloLevel` | enum | **MUST** | prestructural/unistructural/multistructural/relational/extended_abstract |
| `prerequisiteLessons` | array | **SHOULD** | Lesson IDs cần hoàn thành trước |
| `prerequisiteSkills` | array | **SHOULD** | Kỹ năng cần có |
| `curriculumAlignment` | object | **MUST** | Alignment với Cambridge/Common Core |
| `keywords` | array | **MUST** | Min 3, max 10 từ khóa |
| `tags` | array | **SHOULD** | Flexible tagging |
| `difficulty` | enum | **MUST** | beginner / intermediate / advanced |
| `language` | enum | **MUST** | vi / en / bilingual |
| `thumbnail` | string | **SHOULD** | URL ảnh thumbnail |
| `authorId` | string | **MUST** | ID tác giả |
| `reviewerId` | string | **SHOULD** | ID người review |
| `createdAt` | ISO8601 | **MUST** | Ngày tạo |
| `updatedAt` | ISO8601 | **MUST** | Ngày cập nhật |
| `publishedAt` | ISO8601 | **MAY** | Ngày publish |
| `materialRequirements` | array | **MAY** | Vật liệu cần thiết |
| `technologyRequirements` | array | **MAY** | Yêu cầu công nghệ |
| `relatedLessons` | array | **MAY** | Bài học liên quan |
| `culturalContext` | string | **MAY** | VN cultural notes |
| `specialNotes` | string | **MAY** | Ghi chú đặc biệt |

### 1.4 Tagging System

**Tag Categories:**
```
topic:[value]         → topic:addition, topic:animals
skill:[value]         → skill:counting, skill:phonics
thinking:[value]      → thinking:pattern, thinking:comparison
culture:[value]       → culture:tet, culture:midautumn
season:[value]        → season:spring, season:back-to-school
special:[value]       → special:gifted, special:remedial
format:[value]        → format:game, format:story, format:project
```

**Tag Rules:**
- MUST: Mỗi bài có ít nhất 3 tags
- MUST: Không dùng tag tự do — phải thuộc một category đã đăng ký
- SHOULD: Tối đa 15 tags per lesson
- MAY: Custom tags dùng prefix `custom:`

### 1.5 JSON Schema — Lesson Metadata

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://avab.edu.vn/schemas/lesson-metadata/v1.0",
  "title": "AvaB Lesson Metadata",
  "type": "object",
  "required": [
    "lessonId", "title", "subject", "grade", "module", "sequence",
    "version", "status", "ageRange", "estimatedDuration",
    "learningObjectives", "bloomsLevel", "soloLevel",
    "curriculumAlignment", "keywords", "difficulty", "language",
    "authorId", "createdAt", "updatedAt"
  ],
  "properties": {
    "lessonId": {
      "type": "string",
      "pattern": "^(MATH|ENG|CS)-G[1-9]-[A-Z]{2,4}-[0-9]{3}$",
      "description": "Unique lesson identifier"
    },
    "title": {
      "type": "string",
      "minLength": 5,
      "maxLength": 80
    },
    "titleEn": {
      "type": "string",
      "maxLength": 80
    },
    "subject": {
      "type": "string",
      "enum": ["MATH", "ENG", "CS"]
    },
    "grade": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9
    },
    "module": {
      "type": "string",
      "pattern": "^[A-Z]{2,4}$"
    },
    "sequence": {
      "type": "integer",
      "minimum": 1
    },
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "review", "approved", "published", "archived"]
    },
    "ageRange": {
      "type": "object",
      "required": ["min", "max"],
      "properties": {
        "min": { "type": "integer", "minimum": 4, "maximum": 12 },
        "max": { "type": "integer", "minimum": 4, "maximum": 12 }
      }
    },
    "estimatedDuration": {
      "type": "integer",
      "minimum": 10,
      "maximum": 90,
      "description": "Total duration in minutes"
    },
    "learningObjectives": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["id", "statement", "bloomsLevel", "measurable"],
        "properties": {
          "id": { "type": "string" },
          "statement": { "type": "string", "maxLength": 200 },
          "bloomsLevel": {
            "type": "string",
            "enum": ["remember","understand","apply","analyze","evaluate","create"]
          },
          "measurable": { "type": "boolean" }
        }
      }
    },
    "bloomsLevel": {
      "type": "string",
      "enum": ["remember","understand","apply","analyze","evaluate","create"]
    },
    "soloLevel": {
      "type": "string",
      "enum": ["prestructural","unistructural","multistructural","relational","extended_abstract"]
    },
    "prerequisiteLessons": {
      "type": "array",
      "items": { "type": "string", "pattern": "^(MATH|ENG|CS)-G[1-9]-[A-Z]{2,4}-[0-9]{3}$" }
    },
    "prerequisiteSkills": {
      "type": "array",
      "items": { "type": "string" }
    },
    "curriculumAlignment": {
      "type": "object",
      "properties": {
        "cambridge": { "type": "string" },
        "commonCore": { "type": "string" },
        "vietnamMOET": { "type": "string" },
        "ibPYP": { "type": "string" }
      }
    },
    "keywords": {
      "type": "array",
      "minItems": 3,
      "maxItems": 10,
      "items": { "type": "string" }
    },
    "tags": {
      "type": "array",
      "maxItems": 15,
      "items": { "type": "string", "pattern": "^[a-z]+:[a-z0-9-]+$" }
    },
    "difficulty": {
      "type": "string",
      "enum": ["beginner", "intermediate", "advanced"]
    },
    "language": {
      "type": "string",
      "enum": ["vi", "en", "bilingual"]
    },
    "authorId": { "type": "string" },
    "reviewerId": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "publishedAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## 2. LESSON STRUCTURE STANDARD

### 2.1 Mandatory Lesson Flow

Một lesson AvaB MUST bao gồm các component theo đúng thứ tự sau:

```
┌─────────────────────────────────────────────────────────┐
│                    LESSON FLOW                          │
│                                                         │
│  01. Introduction     (MUST)   ~2 min                   │
│  02. Warm-up          (MUST)   ~3–5 min                 │
│  03. Motivation       (MUST)   ~2–3 min                 │
│  04. Story            (SHOULD) ~3–5 min                 │
│  05. Theory           (MUST)   ~8–12 min                │
│  06. Visual Explanation (MUST) ~3–5 min                 │
│  07. Worked Examples  (MUST)   ~5–8 min                 │
│  08. Guided Practice  (MUST)   ~8–10 min                │
│  09. Independent Practice (MUST) ~8–12 min              │
│  10. Challenge        (SHOULD) ~3–5 min                 │
│  11. Mini Game        (SHOULD) ~3–5 min                 │
│  12. Reflection       (MUST)   ~2–3 min                 │
│  13. Summary          (MUST)   ~2–3 min                 │
│  14. Homework         (MUST)   assigned                 │
│  15. Parent Note      (MUST)   async                    │
│  16. Teacher Note     (MUST)   async                    │
│  17. AI Tutor Prompt  (MUST)   integrated               │
│  18. Assessment       (MUST)   continuous               │
│                                                         │
│  TOTAL: 45–75 minutes (vary by grade)                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Specifications

#### Component 01: Introduction
| Attribute | Specification |
|---|---|
| **Purpose** | Kết nối với bài trước, tạo context, giới thiệu chủ đề |
| **Duration** | G1: 1–2 phút / G2–G3: 2–3 phút |
| **Format** | Text + 1 hình ảnh hoặc animation ngắn |
| **MUST** | Mention lesson title, subject icon, grade indicator |
| **MUST** | Review 1 concept từ bài trước (spaced repetition) |
| **SHOULD** | Có câu hỏi kích hoạt prior knowledge |
| **MAY** | Có mascot character xuất hiện |
| **QA Criteria** | Không quá 50 từ (tiếng Việt) / 40 từ (tiếng Anh) |

**Template:**
```
Xin chào [mascot name]! Hôm nay chúng ta sẽ học về [TOPIC].
[Recall question về bài cũ]
[Preview 1 câu hỏi thú vị sẽ trả lời được sau bài học]
```

---

#### Component 02: Warm-up
| Attribute | Specification |
|---|---|
| **Purpose** | Kích hoạt tư duy, kết nối prior knowledge, làm nóng não |
| **Duration** | 3–5 phút |
| **Format** | 2–3 câu hỏi nhanh / mini activity / game nhỏ |
| **MUST** | Liên quan trực tiếp đến chủ đề bài học |
| **MUST** | Phù hợp với 95% học sinh có thể trả lời được |
| **SHOULD** | Có timer / countdown visual |
| **SHOULD** | Immediate feedback khi trả lời |
| **MAY** | Có leaderboard tạm thời |
| **QA Criteria** | Không có câu hỏi "bẫy" — warm-up không dùng để test |

**Anti-patterns:**
- ⚠️ Warm-up quá khó → học sinh mất tự tin ngay từ đầu
- ⚠️ Warm-up không liên quan → mất focus
- ⚠️ Warm-up lấy lại 100% bài cũ → nhàm chán

---

#### Component 03: Motivation
| Attribute | Specification |
|---|---|
| **Purpose** | Trả lời "Tại sao tôi cần học cái này?" |
| **Duration** | 2–3 phút |
| **Format** | Tình huống thực tế / câu hỏi gây tò mò / hook thú vị |
| **MUST** | Kết nối với cuộc sống của trẻ 5–8 tuổi VN |
| **MUST** | Có ít nhất 1 real-world application |
| **SHOULD** | Sử dụng hình ảnh / video ngắn (max 30s) |
| **SHOULD** | Đặt câu hỏi mở trước khi dạy |
| **MAY** | Kể về nhân vật nổi tiếng liên quan |
| **QA Criteria** | Phải trả lời được "So what?" cho đứa trẻ |

**Examples by Subject:**
- MATH: "Mẹ mua 24 cái bánh cho 6 bạn. Mỗi bạn được mấy cái?"
- ENG: "Khi đi Sài Gòn, bạn gặp người nước ngoài — bạn nói gì?"
- CS: "Robot làm thế nào để biết đường đi? Hãy chỉ nó!"

---

#### Component 04: Story
| Attribute | Specification |
|---|---|
| **Purpose** | Embedding kiến thức vào narrative — tăng retention 40% |
| **Duration** | 3–5 phút |
| **Format** | Illustrated story / dialogue / scenario |
| **MUST** (nếu có) | Nhân vật quen thuộc (AvaB mascots hoặc cultural figures) |
| **MUST** (nếu có) | Vấn đề trong story phản ánh đúng concept bài học |
| **SHOULD** | Có conflict → resolution tương ứng với solution của bài |
| **SHOULD** | Bối cảnh VN hoặc universal child-friendly |
| **MAY** | Interactive story (chọn lựa) |
| **MAY** | Animation / audio narration |
| **QA Criteria** | Story không quá 200 từ; không có yếu tố đáng sợ/bạo lực |

**AvaB Mascots:**
- **Ava** — Bạch tuộc thông minh (Toán / Lập trình)
- **Bảo** — Cậu bé 7 tuổi tò mò (Anh văn / Toán)
- **Linh** — Cô bé sáng tạo (Tin học / Art)
- **Robot R3** — Trợ lý AI của lớp học

---

#### Component 05: Theory
| Attribute | Specification |
|---|---|
| **Purpose** | Trình bày kiến thức cốt lõi — clear, structured, age-appropriate |
| **Duration** | G1: 8 phút / G2: 10 phút / G3: 12 phút |
| **Format** | Xem Section 4 (Theory Standard) |
| **MUST** | CPA implementation (xem Section 4.4) |
| **MUST** | Không quá 3 concepts mới trong 1 lesson |
| **MUST** | Có Thinking Tips (max 3) |
| **MUST** | Có Common Mistakes |
| **SHOULD** | Có Summary Card cuối theory |
| **QA Criteria** | Flesch-Kincaid Grade Level ≤ grade level của bài |

---

#### Component 06: Visual Explanation
| Attribute | Specification |
|---|---|
| **Purpose** | Minh họa trực quan concept — dual coding theory |
| **Duration** | 3–5 phút |
| **Format** | Diagram / Animation / Interactive visual / Manipulative |
| **MUST** | Có ít nhất 1 hình minh họa trực tiếp cho concept chính |
| **MUST** | Không chứa text > 10 từ trên 1 hình |
| **SHOULD** | Có step-by-step visual breakdown |
| **SHOULD** | Color-coded để phân biệt concepts |
| **MAY** | Interactive / clickable |
| **QA Criteria** | Hình phải standalone — hiểu được khi không có text |

---

#### Component 07: Worked Examples
| Attribute | Specification |
|---|---|
| **Purpose** | Modeling — "Tôi làm, bạn xem" phase (Vygotsky scaffolding) |
| **Duration** | 5–8 phút |
| **Format** | Xem Section 5 (Example Standard) |
| **MUST** | Min 2 worked examples (warm-up + core) |
| **MUST** | Think-aloud format — hiển thị quá trình suy nghĩ |
| **SHOULD** | 1 extension example cho advanced learners |
| **QA Criteria** | Mỗi bước phải có caption/annotation |

---

#### Component 08: Guided Practice
| Attribute | Specification |
|---|---|
| **Purpose** | "Chúng ta làm cùng nhau" — học sinh thực hành với support |
| **Duration** | 8–10 phút |
| **Format** | 3–5 exercises với scaffolding giảm dần |
| **MUST** | Có AI Tutor hints available |
| **MUST** | Immediate feedback sau mỗi câu |
| **MUST** | Scaffolding level bắt đầu ở level 3, giảm xuống |
| **SHOULD** | Progress indicator |
| **SHOULD** | Encouraging message khi sai (không chỉ "Wrong!") |
| **MAY** | Cho phép unlimited attempts trong guided section |
| **QA Criteria** | Độ khó phải dễ hơn Independent Practice ít nhất 1 bậc |

---

#### Component 09: Independent Practice
| Attribute | Specification |
|---|---|
| **Purpose** | "Bạn tự làm" — kiểm tra real mastery |
| **Duration** | 8–12 phút |
| **Format** | 5–8 exercises, đa dạng loại câu hỏi |
| **MUST** | Không có full solution hint — chỉ strategic hints |
| **MUST** | Ghi nhận attempts và time cho BKT model |
| **MUST** | Min 3 difficulty levels: easy/medium/hard |
| **SHOULD** | Adaptive ordering dựa trên performance |
| **MAY** | Time pressure option (cho gamification) |
| **QA Criteria** | Coverage: ≥80% learning objectives phải có exercise |

---

#### Component 10: Challenge
| Attribute | Specification |
|---|---|
| **Purpose** | Extension cho advanced learners — HOTS (Higher Order Thinking) |
| **Duration** | 3–5 phút |
| **Format** | 1–2 câu khó, open-ended hoặc multi-step |
| **MUST** (nếu có) | Bloom's level ≥ Analyze |
| **SHOULD** | Có multiple valid approaches |
| **SHOULD** | Badge/reward đặc biệt khi hoàn thành |
| **MAY** | Optional — học sinh có thể skip |
| **QA Criteria** | Challenge không được là "cùng loại nhưng số to hơn" |

**Anti-patterns:**
- ⚠️ Challenge quá khó → frustration thay vì stretch
- ⚠️ Challenge chỉ là "harder version" của bài bình thường

---

#### Component 11: Mini Game
| Attribute | Specification |
|---|---|
| **Purpose** | Consolidation through play — tăng retention và motivation |
| **Duration** | 3–5 phút |
| **Format** | Match game / Sorting / Quiz race / Puzzle |
| **MUST** (nếu có) | Game mechanics phải practice đúng concept bài |
| **MUST** | Không phải random game — specifically designed |
| **SHOULD** | Replayable với randomized content |
| **SHOULD** | Score + Leaderboard (class-level, không national) |
| **MAY** | Multiplayer mode (classroom) |
| **QA Criteria** | Winning không dựa vào luck — skill-based |

---

#### Component 12: Reflection
| Attribute | Specification |
|---|---|
| **Purpose** | Metacognition — "Tôi đã học gì? Tôi cảm thấy thế nào?" |
| **Duration** | 2–3 phút |
| **Format** | 2–3 câu hỏi phản tư / self-assessment / emotion check |
| **MUST** | Có ít nhất 1 câu về cảm xúc (traffic light hoặc emoji scale) |
| **MUST** | Có ít nhất 1 câu về nội dung học |
| **SHOULD** | "3-2-1" format: 3 things learned, 2 interesting, 1 question |
| **MAY** | Voice recording option |
| **QA Criteria** | Không có "right answers" trong Reflection |

---

#### Component 13: Summary
| Attribute | Specification |
|---|---|
| **Purpose** | Consolidate key takeaways — memory encoding |
| **Duration** | 2–3 phút |
| **Format** | Bullet points + key visual + vocabulary review |
| **MUST** | Max 5 bullet points |
| **MUST** | Highlight key vocabulary (3–5 từ) |
| **MUST** | Liên kết với next lesson preview |
| **SHOULD** | Printable/saveable Summary Card |
| **QA Criteria** | Summary phải cover tất cả learning objectives |

---

#### Component 14: Homework
| Attribute | Specification |
|---|---|
| **Purpose** | Spaced practice — long-term retention |
| **Format** | Xem Section 7 (Homework Standard) |
| **MUST** | Giao sau khi hoàn thành Independent Practice |
| **MUST** | Có due date (thường 24h hoặc trước buổi học tiếp) |
| **SHOULD** | Digital + optional printable version |

---

#### Component 15: Parent Note
| Attribute | Specification |
|---|---|
| **Purpose** | Kết nối học tại trường với gia đình |
| **Format** | Xem Section 11 (Parent Note Standard) |
| **MUST** | Gửi qua app sau khi lesson completed |
| **MUST** | Non-technical language |

---

#### Component 16: Teacher Note
| Attribute | Specification |
|---|---|
| **Purpose** | Hướng dẫn giáo viên dạy lesson này |
| **Format** | Xem Section 10 (Teacher Guide Standard) |
| **MUST** | Có sẵn trước khi giáo viên dạy (T-1 ngày) |

---

#### Component 17: AI Tutor Prompt
| Attribute | Specification |
|---|---|
| **Purpose** | Personalized AI assistance trong suốt bài học |
| **Format** | Xem Section 9 (AI Tutor Standard) |
| **MUST** | Prompt set phải cover tất cả exercises trong bài |

---

#### Component 18: Assessment
| Attribute | Specification |
|---|---|
| **Purpose** | Thu thập data học sinh để cập nhật BKT model |
| **Format** | Xem Section 12 (Assessment Standard) |
| **MUST** | Continuous — không chỉ cuối bài |
| **MUST** | Data tự động ghi vào learning analytics |

### 2.3 Duration by Grade

| Component | G1 (6–7t) | G2 (7–8t) | G3 (8–9t) |
|---|---|---|---|
| Introduction | 2 min | 2 min | 2 min |
| Warm-up | 3 min | 4 min | 5 min |
| Motivation | 3 min | 2 min | 2 min |
| Story | 5 min | 4 min | 3 min |
| Theory | 8 min | 10 min | 12 min |
| Visual Explanation | 5 min | 4 min | 3 min |
| Worked Examples | 5 min | 6 min | 8 min |
| Guided Practice | 8 min | 9 min | 10 min |
| Independent Practice | 8 min | 10 min | 12 min |
| Challenge | 3 min | 4 min | 5 min |
| Mini Game | 5 min | 4 min | 3 min |
| Reflection | 3 min | 2 min | 2 min |
| Summary | 3 min | 3 min | 3 min |
| **TOTAL** | **61 min** | **64 min** | **70 min** |

### 2.4 Component Sequencing Rules

- MUST: Các component MUST phải xuất hiện đủ và đúng thứ tự
- MUST: Không được bỏ component MUST dù lesson ngắn
- SHOULD: SHOULD components có thể lược bỏ nếu có lý do (ghi vào metadata)
- MAY: MAY components hoàn toàn tùy ngữ cảnh
- MUST NOT: Không đảo thứ tự Theory ↔ Worked Examples
- MUST NOT: Không đặt Assessment riêng biệt — phải tích hợp continuous

---

## 3. LEARNING OBJECTIVE STANDARD

### 3.1 Objective Writing Framework

Mọi Learning Objective MUST theo format:

```
[Action Verb (Bloom's)] + [Content/Skill] + [Condition] + [Criterion]
```

**Example:**
> "**Tính được** (verb) tổng hai số có hai chữ số (content) bằng cách đặt tính dọc (condition) với độ chính xác ≥ 80% (criterion)."

### 3.2 Bloom's Taxonomy — Verb Bank

| Level | Vietnamese | English | Verb Bank (VN) | Verb Bank (EN) |
|---|---|---|---|---|
| 1. Remember | Nhớ | Remember | nhớ, nhận ra, liệt kê, đọc, gọi tên, xác định | recall, recognize, list, name, identify, define |
| 2. Understand | Hiểu | Understand | giải thích, mô tả, tóm tắt, phân loại, so sánh | explain, describe, summarize, classify, compare |
| 3. Apply | Áp dụng | Apply | tính, làm, sử dụng, giải, thực hiện, vẽ | calculate, solve, use, apply, draw, execute |
| 4. Analyze | Phân tích | Analyze | phân tích, phân biệt, kiểm tra, so sánh, tách | analyze, distinguish, examine, differentiate |
| 5. Evaluate | Đánh giá | Evaluate | đánh giá, phê bình, lựa chọn, biện hộ, phán xét | evaluate, critique, judge, justify, assess |
| 6. Create | Sáng tạo | Create | thiết kế, tạo ra, xây dựng, soạn, lập kế hoạch | design, create, construct, compose, plan |

**Grade-Level Bloom's Distribution:**

| Grade | Remember | Understand | Apply | Analyze | Evaluate | Create |
|---|---|---|---|---|---|---|
| G1 | 40% | 35% | 20% | 5% | 0% | 0% |
| G2 | 20% | 35% | 30% | 10% | 3% | 2% |
| G3 | 10% | 25% | 35% | 20% | 5% | 5% |

### 3.3 SOLO Taxonomy Application

| SOLO Level | Đặc điểm | AvaB Use | Sample Objective |
|---|---|---|---|
| Prestructural | Chưa hiểu | Diagnostic | "Nhận ra khi nào bài liên quan đến phép cộng" |
| Unistructural | Biết 1 thứ | Foundation | "Cộng hai số một chữ số" |
| Multistructural | Biết nhiều thứ | Core | "Cộng nhiều số một chữ số với nhau" |
| Relational | Hiểu kết nối | Mastery | "Giải toán có lời văn dùng phép cộng" |
| Extended Abstract | Tạo ra mới | Challenge | "Thiết kế bài toán thực tế cho bạn khác giải" |

### 3.4 Objectives by Capability Dimension

AvaB đánh giá 7 dimensions (xem Section 12):

| Dimension | Example Objective Format |
|---|---|
| Knowledge | "Gọi tên được tất cả hình học cơ bản (tam giác, tứ giác, tròn)" |
| Skill | "Đo được chiều dài bằng thước kẻ với sai số ≤ 1mm" |
| Thinking | "Nhận ra quy luật trong dãy số và dự đoán số tiếp theo" |
| Creativity | "Tạo ra bài toán thực tế từ tình huống cho sẵn" |
| Communication | "Giải thích cách làm bài cho bạn bằng lời" |
| Problem Solving | "Tự chọn chiến lược phù hợp để giải bài toán mới" |
| Confidence | "Tự kiểm tra và sửa bài trước khi nộp" |

### 3.5 Anti-patterns in Objective Writing

| Anti-pattern | Ví dụ sai | Vấn đề | Sửa lại |
|---|---|---|---|
| Vague verb | "Hiểu phép cộng" | Không đo được | "Giải thích được ý nghĩa của phép cộng bằng ví dụ thực tế" |
| Teacher action | "Dạy học sinh cộng" | Sai chủ ngữ | "Học sinh tính được tổng..." |
| Too many objectives | "Biết, hiểu, áp dụng, phân tích..." | Không rõ ràng | Tách thành từng objective riêng |
| No criterion | "Giải được bài toán cộng" | Không đo được | "Giải đúng ≥4/5 bài toán cộng" |
| Content not skill | "Học về hình tam giác" | Thụ động | "Nhận ra và vẽ được hình tam giác" |
| Bloom's mismatch | "Sáng tạo ra kết quả phép cộng" | Level sai | "Tính được..." |

### 3.6 Examples by Subject

**MATH-G2 (Phép chia):**
```
1. [Remember] Gọi tên được các thành phần của phép chia: số bị chia, số chia, thương
2. [Understand] Giải thích được ý nghĩa của phép chia bằng cách chia đồ vật thực tế
3. [Apply] Tính được thương của các phép chia trong bảng chia 2, 3, 4, 5 với độ chính xác 100%
4. [Analyze] Nhận ra mối quan hệ giữa phép nhân và phép chia (fact families)
```

**ENG-G1 (Phonics: Short Vowels):**
```
1. [Remember] Nhận ra âm của 5 nguyên âm ngắn (a, e, i, o, u) khi nghe
2. [Understand] Phân loại từ theo nguyên âm ngắn trung tâm (CVC words)
3. [Apply] Đọc được 20 CVC words mới chưa học với độ chính xác ≥ 80%
```

**CS-G2 (Algorithms):**
```
1. [Remember] Định nghĩa được "thuật toán" là gì
2. [Understand] Giải thích tại sao thứ tự các bước quan trọng
3. [Apply] Viết được các bước làm một việc quen thuộc (như rửa tay) thành sequence
4. [Analyze] Tìm lỗi trong một sequence sai và sửa lại
```

---

## 4. THEORY STANDARD

### 4.1 Theory Length by Grade

| Grade | Age | Min Words | Max Words | Max Concepts | Max Paragraphs |
|---|---|---|---|---|---|
| G1 | 6–7 | 80 | 150 | 1 | 3 |
| G2 | 7–8 | 100 | 200 | 2 | 4 |
| G3 | 8–9 | 120 | 250 | 3 | 5 |

> **Note:** "Concept" = một ý tưởng, định nghĩa, hoặc quy tắc riêng biệt. Cognitive Load Theory: max 7±2 chunks trong working memory — với trẻ 5–8 tuổi, limit là 3–4 chunks.

### 4.2 Cognitive Load Management

**Intrinsic Load** (nội dung bản thân):
- MUST: Tách concept phức tạp thành sub-concepts nhỏ
- MUST: Sequence từ concrete → abstract
- SHOULD: Build on prior knowledge explicitly

**Extraneous Load** (cách trình bày):
- MUST: Mỗi trang chỉ có 1 concept chính
- MUST: Text và hình minh họa đặt cạnh nhau (không tách ra)
- MUST NOT: Thông tin thừa, decorative text không liên quan
- SHOULD: Consistent visual layout qua các bài

**Germane Load** (xây dựng schema):
- SHOULD: Có analogy/metaphor phù hợp độ tuổi
- SHOULD: Liên kết với kiến thức trẻ đã biết
- MAY: Concept map visual

### 4.3 Language Standard by Age

| Grade | Sentence Length | Vocabulary Level | Technical Terms | Explanation Style |
|---|---|---|---|---|
| G1 | Max 8 từ/câu | Thông dụng, 1 âm tiết | Giải thích ngay tại chỗ | Kể chuyện, ví dụ cụ thể |
| G2 | Max 12 từ/câu | Thông dụng + 5 từ mới/bài | Giải thích + ví dụ | Giải thích + minh họa |
| G3 | Max 15 từ/câu | Mở rộng + 7 từ mới/bài | Định nghĩa chính thức | Định nghĩa + ứng dụng |

**Language Checklist:**
- [ ] Không dùng từ thuần túy trừu tượng (ví dụ: "khái niệm", "phương pháp")
- [ ] Mọi thuật ngữ mới phải được bold và giải thích
- [ ] Câu chủ động > câu bị động
- [ ] Không dùng passive voice trong G1
- [ ] Sử dụng "em", "bạn" thay vì "học sinh"

### 4.4 CPA Implementation

```
CONCRETE → PICTORIAL → ABSTRACT
    ↑            ↑           ↑
  Vật thật    Hình ảnh    Ký hiệu
  Manipulate  Diagram     Số/Công thức
```

| Phase | G1 Emphasis | G2 Emphasis | G3 Emphasis |
|---|---|---|---|
| Concrete | 60% | 40% | 20% |
| Pictorial | 30% | 40% | 40% |
| Abstract | 10% | 20% | 40% |

**Implementation per Subject:**

*MATH — Phép cộng:*
- C: Dùng đồ vật thật (kẹo, khối gỗ) đếm và gộp
- P: Hình ảnh các đồ vật, thanh số (number line), bar model
- A: 3 + 4 = 7, viết tính dọc

*ENG — Phonics:*
- C: Thẻ chữ thật, âm thanh thực tế
- P: Hình ảnh từ + âm gạch chân, mouth diagram
- A: Ký hiệu phiên âm IPA đơn giản

*CS — Algorithms:*
- C: Hành động thực tế (bước đi, robot toy)
- P: Sơ đồ khối, arrow diagrams
- A: Pseudocode, block code (Scratch)

### 4.5 Theory Template

```markdown
## [Tên Concept]

[Câu mở đầu kết nối với Motivation/Story — 1 câu]

### [Concept Name] là gì?
[Định nghĩa đơn giản — max 1 câu cho G1, 2 câu cho G2-G3]

> 💡 **Ví dụ:** [1–2 ví dụ cụ thể, liên quan cuộc sống]

[Nếu có visual — chèn hình tại đây, caption rõ ràng]

### Cách [làm/tính/nhận ra]...
[Step-by-step, mỗi bước 1 dòng, ngắn gọn]

1. Bước 1: ...
2. Bước 2: ...
3. Bước 3: ...

[Visual minh họa steps]

---
### ⚠️ Lỗi Thường Gặp
| Lỗi sai | Tại sao sai | Cách đúng |
|---|---|---|
| [Lỗi 1] | [Giải thích] | [Đúng] |
| [Lỗi 2] | [Giải thích] | [Đúng] |

---
### 💡 Mẹo Tư Duy (max 3)
> 🔑 **Mẹo 1:** [Một câu ngắn, dễ nhớ]
> 🔑 **Mẹo 2:** [Một câu ngắn, dễ nhớ]
> 🔑 **Mẹo 3:** [Tùy chọn]

---
### 🌍 Trong Cuộc Sống...
[1–2 câu ứng dụng thực tế, bối cảnh VN]

---
### 📋 Tóm Tắt (Summary Card)
| Khái niệm | Định nghĩa ngắn |
|---|---|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |
| [Công thức/Quy tắc] | [Nội dung] |
```

### 4.6 Common Mistakes Format

| Mistake | Why It Happens | Correct Approach | Detection Signal |
|---|---|---|---|
| [Mô tả lỗi] | [Nguyên nhân cognitive] | [Cách đúng] | [Dấu hiệu nhận ra lỗi] |

**Requirements:**
- MUST: Mọi theory section phải có ít nhất 2 Common Mistakes
- MUST: Mistakes phải là thực tế, thường gặp — không phải lý thuyết
- SHOULD: Có detection signal để AI Tutor nhận diện
- SHOULD: Mô tả cả misconceptions (không chỉ careless errors)

### 4.7 Thinking Tips Format

```
💡 Mẹo [số]: [Tiêu đề ngắn]
[1 câu giải thích. Dễ nhớ. Có thể là rhyme hoặc acronym.]
Ví dụ: "Số lớn CỘNG số nhỏ = số lớn hơn cả hai!"
```

**Rules:**
- MUST: Max 3 Thinking Tips per lesson
- MUST: Mỗi tip phải liên kết trực tiếp với concept
- SHOULD: Tips có thể dùng lại qua nhiều bài (cumulative tips bank)
- MUST NOT: Tip không được sai về mặt toán học / ngôn ngữ học

---

## 5. EXAMPLE STANDARD

### 5.1 Example Progression

```
Warm-up Example → Core Example → Extension Example
     ↓                  ↓               ↓
  Familiar          New concept      Transfer/
  context          + strategy       Application
  Easy             Medium           Hard
```

### 5.2 Mandatory Example Format

Mọi Worked Example MUST theo format 5 bước:

```
┌─────────────────────────────────────────┐
│  WORKED EXAMPLE                         │
├─────────────────────────────────────────┤
│  📖 CONTEXT                             │
│  [Tình huống / đề bài — 1–2 câu]       │
│  [Visual nếu có]                        │
├─────────────────────────────────────────┤
│  🎯 STRATEGY                            │
│  [Chọn chiến lược nào? Tại sao?]        │
│  [Think-aloud: "Mình sẽ dùng...         │
│   vì..."]                               │
├─────────────────────────────────────────┤
│  📐 SOLUTION                            │
│  Bước 1: [Action + explanation]         │
│  Bước 2: [Action + explanation]         │
│  Bước 3: [Answer clearly stated]        │
│  [Visual/working shown at each step]    │
├─────────────────────────────────────────┤
│  ✅ CHECK                               │
│  [Cách kiểm tra đáp án]                 │
│  [Estimate vs exact — does it make      │
│   sense?]                               │
├─────────────────────────────────────────┤
│  💡 INSIGHT                             │
│  [1 câu — điều quan trọng nhất cần     │
│   nhớ từ ví dụ này]                    │
└─────────────────────────────────────────┘
```

### 5.3 Number of Examples by Lesson Type

| Lesson Type | Warm-up | Core | Extension | Total |
|---|---|---|---|---|
| Concept Introduction | 1 | 2 | 1 | 4 |
| Skill Practice | 1 | 3 | 1 | 5 |
| Problem Solving | 1 | 2 | 2 | 5 |
| Review/Consolidation | 2 | 2 | 1 | 5 |
| Assessment Prep | 1 | 3 | 2 | 6 |

### 5.4 Illustration Requirements for Examples

| Example Type | Min Visuals | Required Visual Elements |
|---|---|---|
| Warm-up | 1 | Context image |
| Core | 2 | Context + step-by-step diagram |
| Extension | 1 | Context hoặc strategy diagram |

**Visual Rules:**
- MUST: Core example phải có annotated step visuals
- SHOULD: Dùng consistent color cho "unknown" (vàng), "given" (xanh), "answer" (đỏ)
- MUST NOT: Solution visual chứa text nhiều hơn step labels

### 5.5 Thinking Process Visualization

**Math Example — Visualization:**
```
Problem: 24 ÷ 4 = ?

THINK: "Chia cho 4 nghĩa là chia đều thành 4 phần bằng nhau"

VISUALIZE:
[●●●●●●][●●●●●●][●●●●●●][●●●●●●]
   6        6        6        6

OR: Bar Model
|----24----|
|--?--|--?--|--?--|--?--|
   6     6     6     6

ANSWER: 24 ÷ 4 = 6
CHECK: 6 × 4 = 24 ✓ "Nhân ngược lại để kiểm tra!"
```

---

## 6. EXERCISE STANDARD

### 6.1 Exercise Taxonomy — Complete Table (20+ Types)

| # | Tên | Mã | Mục tiêu sư phạm | Age Fit | Dùng khi | Không dùng khi |
|---|---|---|---|---|---|---|
| 1 | Multiple Choice | MCQ | Recognition, recall | 5–8 | Test knowledge, quick check | Cần show working |
| 2 | True/False | TF | Basic comprehension | 5–7 | Misconception check | Guessability cao |
| 3 | Fill in the Blank | FIB | Recall, apply | 6–8 | Vocabulary, formula completion | Ambiguous context |
| 4 | Matching | MAT | Association, classification | 5–8 | Vocabulary pairs, concept pairs | More than 8 pairs |
| 5 | Sorting / Ordering | SRT | Sequence, ranking | 5–8 | Algorithms, timeline, story order | Random items |
| 6 | Classification | CLS | Categorization, analysis | 6–8 | Venn diagram, group sorting | Too many categories |
| 7 | Pattern Completion | PAT | Inductive reasoning | 5–8 | Math patterns, visual patterns | Unclear rule |
| 8 | Sequence (Algorithm) | SEQ | Procedural thinking | 6–8 | CS lessons, steps of a process | Open-ended problems |
| 9 | Number Input | NUM | Calculation accuracy | 6–8 | Math computation | G1 (prefer MCQ) |
| 10 | Typing / Short Answer | TYP | Recall, spelling | 6–8 | English vocabulary | G1 (motor difficulty) |
| 11 | Speaking / Voice | SPK | Pronunciation, fluency | 5–8 | English, reading aloud | Noisy environments |
| 12 | Listening | LST | Listening comprehension | 5–8 | English, audio stories | Hearing-impaired context |
| 13 | Drag & Drop | DRG | Manipulation, arrangement | 5–8 | Sorting, matching, labeling | Mobile (small screen) |
| 14 | Drawing | DRW | Creative expression, spatial | 5–8 | Geometry, CS diagrams | Assessment (subjective) |
| 15 | Coding (Block) | COD | Computational thinking | 6–8 | CS lessons, Scratch | G1 (complexity) |
| 16 | Open Question | OPN | Higher-order thinking | 7–8 | Challenge, reflection | Formative quick checks |
| 17 | Mind Map | MMP | Synthesis, connections | 7–8 | Review, concept connections | Intro lessons |
| 18 | Puzzle | PZL | Problem solving, persistence | 5–8 | Challenge, gamification | Time-pressured contexts |
| 19 | Project | PRJ | Apply, create, integrate | 7–8 | End of module | Short lessons |
| 20 | Reflection Journal | RJL | Metacognition | 6–8 | End of lesson, end of week | G1 (writing difficulty) |
| 21 | Timeline | TML | Sequencing, history | 7–8 | CS history, story order | Abstract content |
| 22 | Multi-Select | MSL | Analysis, nuance | 7–8 | Complex criteria | G1–G2 (confusion) |
| 23 | Spot the Mistake | STM | Error analysis, critical | 6–8 | Common mistakes section | Intro lessons |
| 24 | Word Problem | WRD | Apply, problem solve | 6–8 | Math contextual | Pure drill |

### 6.2 Exercise Data Schema (Per Type)

#### MCQ — Multiple Choice
```json
{
  "type": "MCQ",
  "id": "EX-MATH-G2-QLD-003-001",
  "stem": "Hình nào có 4 cạnh bằng nhau?",
  "image": "shapes_comparison.png",
  "options": [
    { "id": "A", "text": "Hình chữ nhật", "image": null },
    { "id": "B", "text": "Hình vuông", "image": null },
    { "id": "C", "text": "Hình tam giác", "image": null },
    { "id": "D", "text": "Hình thang", "image": null }
  ],
  "correctAnswer": "B",
  "explanation": "Hình vuông có 4 cạnh bằng nhau. Hình chữ nhật chỉ có 2 cặp cạnh bằng nhau.",
  "hint": "Dùng thước đo thử xem!",
  "difficulty": "easy",
  "bloomsLevel": "remember",
  "points": 1,
  "timeLimit": 30,
  "tags": ["shapes", "quadrilateral"]
}
```

#### MAT — Matching
```json
{
  "type": "MAT",
  "id": "EX-ENG-G1-VOC-005-003",
  "instruction": "Nối từ với hình ảnh đúng",
  "leftItems": [
    { "id": "L1", "text": "cat", "image": null },
    { "id": "L2", "text": "dog", "image": null },
    { "id": "L3", "text": "fish", "image": null }
  ],
  "rightItems": [
    { "id": "R1", "image": "fish.png", "text": null },
    { "id": "R2", "image": "dog.png", "text": null },
    { "id": "R3", "image": "cat.png", "text": null }
  ],
  "correctPairs": [
    { "left": "L1", "right": "R3" },
    { "left": "L2", "right": "R2" },
    { "left": "L3", "right": "R1" }
  ],
  "difficulty": "easy",
  "bloomsLevel": "remember",
  "gradingLogic": "partial",
  "pointsPerPair": 1
}
```

#### SRT — Sorting / Ordering
```json
{
  "type": "SRT",
  "id": "EX-CS-G2-ALG-002-004",
  "instruction": "Sắp xếp các bước theo đúng thứ tự",
  "items": [
    { "id": "1", "text": "Đổ nước vào ấm", "correctPosition": 3 },
    { "id": "2", "text": "Cắm điện ấm", "correctPosition": 4 },
    { "id": "3", "text": "Lấy ấm ra", "correctPosition": 1 },
    { "id": "4", "text": "Mở nắp ấm", "correctPosition": 2 }
  ],
  "gradingLogic": "exact_order",
  "points": 4,
  "difficulty": "medium"
}
```

#### FIB — Fill in the Blank
```json
{
  "type": "FIB",
  "id": "EX-MATH-G2-OPS-010-002",
  "template": "35 + ___ = 50",
  "blanks": [
    {
      "id": "B1",
      "position": 1,
      "correctAnswers": ["15"],
      "acceptedFormats": ["integer"],
      "tolerance": 0
    }
  ],
  "explanation": "50 - 35 = 15, vậy số cần điền là 15",
  "difficulty": "medium",
  "bloomsLevel": "apply",
  "points": 2
}
```

#### SPK — Speaking
```json
{
  "type": "SPK",
  "id": "EX-ENG-G1-PHO-003-007",
  "instruction": "Đọc to từ sau và nhấn vào micro",
  "target": { "text": "cat", "phoneme": "/kæt/", "audio": "cat.mp3" },
  "assessment": {
    "method": "AI_phoneme_detection",
    "minConfidence": 0.75,
    "feedbackOnFail": "Hãy nghe lại và thử một lần nữa!",
    "maxAttempts": 3
  },
  "difficulty": "easy",
  "points": 1
}
```

#### COD — Block Coding
```json
{
  "type": "COD",
  "id": "EX-CS-G2-ALG-004-001",
  "instruction": "Kéo các khối để robot đi đến đích",
  "environment": "scratch_jr",
  "initialState": { "robotPosition": [0,0], "targetPosition": [3,2] },
  "availableBlocks": ["move_right", "move_up", "move_down", "move_left"],
  "solution": {
    "acceptedSolutions": [
      ["move_right","move_right","move_right","move_up","move_up"],
      ["move_up","move_up","move_right","move_right","move_right"]
    ],
    "evaluationType": "end_state"
  },
  "difficulty": "medium",
  "bloomsLevel": "apply",
  "points": 3
}
```

#### OPN — Open Question
```json
{
  "type": "OPN",
  "id": "EX-MATH-G3-WRD-008-009",
  "question": "Bạn có 20.000 đồng. Bạn muốn mua kẹo và bánh. Hãy tính xem có thể mua những gì.",
  "rubric": {
    "understanding": { "weight": 30, "criteria": "Hiểu context và số liệu" },
    "strategy": { "weight": 30, "criteria": "Dùng chiến lược hợp lý" },
    "calculation": { "weight": 20, "criteria": "Tính đúng" },
    "communication": { "weight": 20, "criteria": "Trình bày rõ ràng" }
  },
  "aiReviewEnabled": true,
  "sampleAnswer": "Mua 2 gói kẹo (5.000đ × 2 = 10.000đ) và 1 bánh (10.000đ). Tổng = 20.000đ.",
  "points": 4
}
```

### 6.3 Grading Logic Rules

| Type | Grading | Partial Credit | Explanation |
|---|---|---|---|
| MCQ | Binary (0/1) | No | Chỉ đúng hoặc sai |
| TF | Binary (0/1) | No | Không partial |
| FIB | Binary per blank | Yes (per blank) | Mỗi blank tính riêng |
| MAT | Per pair | Yes | 1 điểm / cặp đúng |
| SRT | Positional | Yes (adjacent) | -1 cho mỗi vị trí sai |
| NUM | Tolerance-based | No | Phải chính xác trừ khi có tolerance |
| SPK | AI confidence | Yes (scale) | 0.75+ = full, 0.5–0.75 = partial |
| COD | End-state / Step | Context | Tuỳ exercise design |
| OPN | Rubric | Yes | Xem rubric dimensions |
| DRW | AI assessment | Yes | Computer vision + rubric |

### 6.4 Exercise Anti-patterns

| Anti-pattern | Ví dụ | Vấn đề |
|---|---|---|
| Double negative | "Câu nào KHÔNG phải KHÔNG đúng?" | Confusing for children |
| Trick question | Hỏi trick thay vì concept | Measures cleverness, not learning |
| Too much text | Stem dài 100+ từ | Exceeds reading capacity G1–G3 |
| All-of-above | Option D: "Tất cả đều đúng" | Reduces discrimination |
| Implausible distractors | "Hình tam giác có mấy góc? A)3 B)100 C)45 D)0" | No discrimination |
| Culturally biased | Reference to non-VN context | Unfair advantage |
| Inconsistent format | Mix hỏi tiếng Việt và tiếng Anh | Confusion |
| Ambiguous answer | "Chọn số lớn nhất" (không rõ từ đâu) | Multiple valid answers |

---

## 7. HOMEWORK STANDARD

### 7.1 Homework Volume by Grade

| Grade | Age | Total Questions | Easy | Medium | Hard |
|---|---|---|---|---|---|
| G1 | 6–7 | 4–5 câu | 3 (60%) | 1–2 (30%) | 0 (10%) |
| G2 | 7–8 | 5–6 câu | 2 (40%) | 2–3 (45%) | 1 (15%) |
| G3 | 8–9 | 6–8 câu | 2 (30%) | 3–4 (50%) | 1–2 (20%) |

### 7.2 Time Allocation by Age

| Grade | Recommended Time | Max Time | Subject Mix |
|---|---|---|---|
| G1 | 10–15 phút | 20 phút | Single subject |
| G2 | 15–20 phút | 25 phút | Single subject |
| G3 | 20–30 phút | 35 phút | Single hoặc 2 subjects |

> **Research basis:** APA recommendation: 10 min per grade level (Grade 1 = 10 min, Grade 2 = 20 min). AvaB adjusts downward for digital fatigue.

### 7.3 Difficulty Distribution Rationale

```
Spaced Repetition Formula: Review:New:Challenge = 40%:40%:20%

Review (40%):     Questions từ các bài 3–7 ngày trước
New (40%):        Questions từ bài hôm nay
Challenge (20%):  Extension questions (Bloom's Analyze+)
```

| Grade | Review % | New % | Challenge % |
|---|---|---|---|
| G1 | 50% | 40% | 10% |
| G2 | 40% | 40% | 20% |
| G3 | 35% | 40% | 25% |

### 7.4 Homework Format Standard

```markdown
## 📚 Bài Tập Về Nhà — [Lesson Title]

**Bài:** [Lesson ID]  
**Ngày giao:** [Date]  
**Ngày nộp:** [Due Date]  
**Thời gian ước tính:** [X] phút  

---

### Phần 1: Ôn tập (Review)
[Câu 1–N: Easy/Medium — từ bài cũ]

### Phần 2: Luyện tập (New)
[Câu N+1–M: Easy/Medium — từ bài hôm nay]

### Phần 3: Thử thách (Challenge) ⭐
[Câu cuối: Medium/Hard — extension]
*Phần này không bắt buộc — nhưng có điểm thưởng!*

---
### 💡 Gợi Ý
[Strategic hints — không cho đáp án thẳng]

### ✅ Đáp Án
[Hiện sau khi học sinh nộp bài — hoặc sau due date]

### 📝 Lời Giải Chi Tiết
[Full worked solution — hiện sau khi xem đáp án]
```

### 7.5 Answer and Solution Requirements

| Component | Requirement |
|---|---|
| Correct Answer | MUST: Cung cấp cho tất cả câu (hiện sau nộp) |
| Step-by-step Solution | MUST: Cho Medium và Hard; SHOULD cho Easy |
| Alternative Solutions | SHOULD: Khi có nhiều cách giải hợp lệ |
| Common Mistake Note | SHOULD: Cho Hard questions |
| Visual Solution | MUST: Cho geometry; SHOULD: Math word problems |

### 7.6 Homework Anti-patterns

- ⚠️ Homework giống hệt bài học trong ngày — không có review
- ⚠️ Chỉ có drill, không có thinking questions
- ⚠️ Quá nhiều câu → burnout, negative attitude
- ⚠️ Không có solution → không có feedback loop
- ⚠️ Hard questions chiếm >25% → anxiety, family stress

---

## 8. ILLUSTRATION STANDARD

### 8.1 Art Style Guidelines

**Primary Style:** Flat Illustration, 2D, vector-based
**Character Design:** Rounded shapes, friendly expressions, diverse representation
**Cultural Context:** Bối cảnh Việt Nam — thức ăn VN, phong cảnh quen thuộc, trang phục mix truyền thống/hiện đại
**Age Appropriateness:** Màu sắc tươi sáng, lines rõ ràng, không quá rối mắt

**Style Forbidden:**
- ❌ Realistic photography (trừ reference cho real-world application)
- ❌ Highly detailed/busy illustrations
- ❌ Dark/scary themes (monsters, violence)
- ❌ Stereotyping gender/ethnicity

### 8.2 Color System

#### Primary Palette (Brand)
| Color Name | Hex | Usage |
|---|---|---|
| AvaB Blue | #4A90E2 | Primary UI, Math subject |
| AvaB Green | #7ED321 | Success, CS subject |
| AvaB Orange | #F5A623 | English subject, warnings |
| AvaB Purple | #9B59B6 | Challenge, special |
| AvaB Yellow | #F8E71C | Highlight, rewards |
| AvaB Red | #E74C3C | Error, alerts |

#### Subject Color Coding
| Subject | Primary | Secondary | Accent |
|---|---|---|---|
| MATH | #4A90E2 (Blue) | #5DADE2 | #F8E71C |
| ENG | #F5A623 (Orange) | #FAD7A0 | #E74C3C |
| CS | #7ED321 (Green) | #A9DFBF | #9B59B6 |

#### Difficulty Color Coding
| Level | Color | Hex |
|---|---|---|
| Easy | Green | #27AE60 |
| Medium | Orange | #E67E22 |
| Hard | Red | #E74C3C |
| Challenge | Purple | #8E44AD |

#### Emotional Color Coding (Traffic Light System)
| Emotion | Color | Usage |
|---|---|---|
| Happy/Confident | Green | Positive feedback |
| Neutral/Unsure | Yellow | Reflection check-in |
| Frustrated/Stuck | Red | Alert for AI Tutor |

### 8.3 Icon Set Standard

**Required Icon Set (40 minimum):**
```
Academic: book, pencil, calculator, globe, microscope, computer
Math: +, -, ×, ÷, =, %, shapes, number line, fraction bar
English: letter A, speech bubble, headphones, microphone, star
CS: code block, robot, arrow, loop, conditional
Feedback: star, trophy, badge, heart, lightning, checkmark, X
Navigation: home, back, next, menu, search, settings
Gamification: coins, gem, streak, level-up, timer, leaderboard
```

**Icon Rules:**
- MUST: Consistent line weight (2px stroke)
- MUST: Same corner radius within a set
- MUST: Min size 24×24px touch target
- SHOULD: Available in 3 sizes: 16px, 24px, 48px

### 8.4 Whitespace Rules

| Page Type | Minimum Margin | Content Width | Text-to-Image Ratio |
|---|---|---|---|
| Theory Page | 16px all sides | 85% viewport | 60% text / 40% image (G1) |
| Exercise Page | 12px all sides | 90% viewport | 50% text / 50% image |
| Summary Card | 20px all sides | 80% viewport | 40% text / 60% image |
| Game Screen | 8px all sides | 95% viewport | 20% text / 80% visual |

### 8.5 Image Quantity per Page

| Component | Min Images | Max Images | Notes |
|---|---|---|---|
| Introduction | 1 | 2 | Cover art + optional mascot |
| Theory Section | 1 | 4 | 1 per concept |
| Worked Example | 1 | 3 | Context + steps |
| Exercise | 0 | 1 | Only if content requires |
| Summary | 1 | 2 | Summary card visual |
| Homework | 0 | 1 | Optional context image |

### 8.6 Image Sizes

| Use Case | Size | Format | Max File Size |
|---|---|---|---|
| Thumbnail | 320×180px | WebP | 50KB |
| Inline (within text) | 400×300px | WebP/SVG | 100KB |
| Full-page visual | 800×600px | WebP/SVG | 200KB |
| Game background | 1280×720px | WebP | 300KB |
| Print export | 1754×1240px | PDF/PNG | 2MB |
| Icon | 48×48px | SVG | 10KB |

### 8.7 Text-to-Image Ratio by Age

| Grade | Theory Text% | Theory Image% | Reasoning |
|---|---|---|---|
| G1 | 40% | 60% | Limited reading ability — visual primary |
| G2 | 50% | 50% | Balanced |
| G3 | 60% | 40% | Text comprehension increases |

### 8.8 Accessibility Requirements

- MUST: Alt text cho mọi hình ảnh (tiếng Việt)
- MUST: Color contrast ratio ≥ 4.5:1 (WCAG AA)
- MUST: Không dùng màu làm phương tiện truyền thông DUY NHẤT (phải có shape/text backup)
- MUST: Hình ảnh quan trọng không bị che bởi UI overlay
- SHOULD: High contrast mode available
- SHOULD: Text size adjustable (min 14px body text)
- MAY: Audio description cho complex diagrams

---

## 9. AI TUTOR STANDARD

### 9.1 AvaB AI Tutor Philosophy

AI Tutor không phải là "answer machine" — mà là **Socratic Coach**: dẫn dắt học sinh tự tìm ra câu trả lời thông qua câu hỏi gợi ý.

```
WRONG model: Student asks → AI gives answer
RIGHT model: Student asks → AI asks better question → Student thinks → Student discovers
```

### 9.2 Socratic Method Implementation

**5 Levels of Socratic Questioning:**
1. **Clarifying** — "Em đang cố làm gì? Bài hỏi gì?"
2. **Probing assumptions** — "Em nghĩ tại sao bước này đúng?"
3. **Probing evidence** — "Em dựa vào đâu để kết luận vậy?"
4. **Perspective-taking** — "Nếu thay số khác, kết quả thế nào?"
5. **Meta-questioning** — "Em học được gì từ bài này?"

### 9.3 AI Tutor 5-Step Response Framework

```
STEP 1: ACKNOWLEDGE (Always)
→ Recognize student's emotion/effort
→ "Em đã thử rồi, tốt lắm! / Em đang gần đúng rồi!"

STEP 2: DIAGNOSE (Always)
→ Identify WHERE student is stuck
→ Check: Missing concept? Calculation error? Misunderstood question?

STEP 3: SCAFFOLD (Always)
→ Give a hint at the right level (see Scaffolding Levels below)
→ Never give full answer unless Level 5 exhausted

STEP 4: CHECK UNDERSTANDING (SHOULD)
→ Ask a micro-question to verify student got the hint
→ "Em hiểu mẹo này chưa? Thử áp dụng xem!"

STEP 5: ENCOURAGE (Always)
→ Motivational closing
→ "Em gần làm được rồi! Thử tiếp đi!"
```

### 9.4 Scaffolding Levels (1–5)

| Level | Name | Description | When to Use | Example |
|---|---|---|---|---|
| 1 | Metacognitive prompt | Hỏi về quá trình suy nghĩ | First attempt | "Em đang nghĩ gì vậy? Bài yêu cầu gì?" |
| 2 | Direction hint | Chỉ hướng tiếp cận | After L1 fails | "Mẹo: Hãy thử vẽ hình ra trước nhé!" |
| 3 | Worked analogy | Ví dụ tương tự | After L2 fails | "Nhớ bài phép cộng không? Đây cũng tương tự vậy!" |
| 4 | Partial solution | Làm một phần cho xem | After L3 fails | "Bước 1 là: 24 ÷ 4... em thử tiếp bước 2 xem?" |
| 5 | Full worked example | Giải hoàn chỉnh | After L4 fails + 3 attempts | "Oke, mình giải cùng nhau nhé: ..." |

**Scaffolding Rules:**
- MUST: Bắt đầu từ Level 1, tăng dần — không skip
- MUST: Ghi nhận scaffolding level vào session data (cho analytics)
- MUST: Level 5 chỉ dùng sau ≥ 3 attempts failed
- SHOULD: Reset về Level 1 cho câu mới
- MUST NOT: Nhảy thẳng từ Level 1 → Level 5

### 9.5 Forbidden Responses List

AI Tutor MUST NOT:
1. ❌ Cho đáp án thẳng khi chưa qua Scaffolding Level 3+
2. ❌ Nói "Sai!" hay "Không đúng!" không có explanation
3. ❌ Sử dụng ngôn ngữ sarcastic hoặc impatient
4. ❌ So sánh học sinh với người khác ("Bạn A làm được tại sao em không?")
5. ❌ Nói "Câu này dễ mà!" (invalidates struggle)
6. ❌ Trả lời câu hỏi không liên quan đến bài học
7. ❌ Thảo luận chủ đề không phù hợp trẻ em
8. ❌ Đưa thông tin sai ("hallucinate" facts)
9. ❌ Dùng ngôn ngữ phức tạp hơn level của học sinh
10. ❌ Trả lời quá dài (> 80 từ per response)

### 9.6 Emotional Intelligence Rules

| Detected Emotion | Signal | AI Response |
|---|---|---|
| Frustration | "Em không hiểu gì cả" / 3+ wrong answers | Soft tone, validate, reduce difficulty |
| Boredom | Fast clicking, skipping | Offer challenge version |
| Confidence | Quick correct answers | Offer harder variant immediately |
| Anxiety | Long pause before answering | Reassure, hint early |
| Excitement | Frequent engagement | Fuel enthusiasm, expand exploration |

**Emotional Validation Scripts:**
```
Frustration: "Bài này hơi khó một chút — điều đó hoàn toàn ổn! Hãy thử lại, mình giúp em nhé."
Boredom:     "Em làm nhanh quá! Muốn thử câu khó hơn không?"
Confidence:  "Giỏi lắm! Thử câu thử thách này xem em có làm được không!"
```

### 9.7 AI Prompt Templates per Component

#### Theory Prompt
```
SYSTEM: Bạn là AI Tutor của AvaB, dạy {subject} cho trẻ {age} tuổi.
Lesson: {lesson_id} — {title}
Concept: {concept}
Student level: {bkt_mastery_probability}
Language: Vietnamese (simple, friendly, age-appropriate)

USER (student): {question}

CONSTRAINTS:
- Max 60 words response
- Use scaffolding level: {current_level}
- Never give direct answer (unless level 5)
- End with an encouraging question
- Emoji use: 1–2 per response, child-friendly
```

#### Exercise Hint Prompt
```
SYSTEM: Student is working on: {exercise_id}
Exercise type: {type}
Correct answer: {answer} [HIDDEN FROM RESPONSE]
Common mistakes for this exercise: {mistake_list}
Student's attempt: {student_answer}
Scaffolding level: {level} (1=metacognitive, 5=worked)

Respond with a hint at level {level}.
Do NOT reveal the answer unless level >= 5.
Max 50 words. Be warm and encouraging.
```

### 9.8 AI Tutor Quality Evaluation Criteria

| Criterion | Weight | Measurement |
|---|---|---|
| Pedagogical accuracy | 25% | Is the hint correct and aligned with curriculum? |
| Socratic quality | 20% | Does it guide without giving away? |
| Age appropriateness | 20% | Language level, vocabulary |
| Emotional tone | 15% | Warm, patient, encouraging |
| Brevity | 10% | ≤ 80 words |
| Learning outcome | 10% | Did student succeed after hint? |

---

## 10. TEACHER GUIDE STANDARD

### 10.1 Teacher Guide Template

```markdown
# Teacher Guide: [Lesson Title]
**Lesson ID:** [ID] | **Subject:** [Subject] | **Grade:** [Grade]
**Duration:** [X] minutes | **Prepared by:** [Author] | **Date:** [Date]

---

## 1. Lesson Snapshot
| Field | Detail |
|---|---|
| Main concept | [1–2 sentences] |
| Learning objectives | [List from metadata] |
| Materials needed | [List] |
| Digital tools | [List] |
| Prerequisite check | [Brief note] |

---

## 2. Lesson Objectives (Teacher-Facing)
By the end of this lesson, students should be able to:
- [Observable outcome 1]
- [Observable outcome 2]
- [Observable outcome 3]

**Success indicator:** [How teacher knows students got it]

---

## 3. Key Teaching Points
1. **[Key Point 1]** — [Explanation + what to emphasize]
2. **[Key Point 2]** — [Explanation + what to emphasize]
3. **[Key Point 3]** — [Explanation + what to emphasize]

---

## 4. Common Student Misconceptions
| Misconception | Why Students Think This | How to Address |
|---|---|---|
| [Misconception 1] | [Cognitive reason] | [Teaching strategy] |
| [Misconception 2] | [Cognitive reason] | [Teaching strategy] |
| [Misconception 3] | [Cognitive reason] | [Teaching strategy] |

---

## 5. Discussion Questions
**Opening (Motivation phase):**
- [Question 1]
- [Question 2]

**During theory:**
- [Question 3]
- [Question 4]

**Closing (Reflection):**
- [Question 5]

---

## 6. Differentiation Strategies
### 6a. For Advanced/Gifted Students
- [Extension activity]
- [Challenge question]
- [Cross-curricular connection]

### 6b. For Average Students
- [Standard approach]
- [Recommended pacing]

### 6c. For Students Needing Support
- [Scaffolding technique]
- [Simplified version]
- [Additional manipulatives]
- [Peer pairing strategy]

---

## 7. Time Management Guide
| Phase | Planned Time | Flex Time | If Short on Time... |
|---|---|---|---|
| Intro + Warm-up | [X] min | ±1 min | Skip warm-up extension |
| Theory | [X] min | ±2 min | Focus on core only |
| Practice | [X] min | ±2 min | Reduce to 3 exercises |
| Wrap-up | [X] min | ±1 min | Never skip |

---

## 8. Assessment Rubric (Formative)
| Dimension | Beginning | Developing | Proficient | Advanced |
|---|---|---|---|---|
| Knowledge | ... | ... | ... | ... |
| Skill | ... | ... | ... | ... |
| Thinking | ... | ... | ... | ... |

---

## 9. Transition Notes
**From previous lesson:** [What students should already know]
**To next lesson:** [How to bridge]

---

## 10. Teacher Reflection Prompts
After teaching, consider:
- [ ] Which students needed most support?
- [ ] Which misconception was most common?
- [ ] What would I do differently?
- [ ] Was the pacing appropriate?
```

---

## 11. PARENT NOTE STANDARD

### 11.1 Format and Length

| Attribute | Rule |
|---|---|
| Maximum length | 150 words (Vietnamese) / 120 words (English) |
| Reading level | Non-technical — assume no education background |
| Tone | Warm, encouraging, actionable |
| Format | Short paragraphs OR bullet list (max 4 bullets) |
| Language | Vietnamese primary; English optional alongside |

### 11.2 Required Content (MUST)

1. **Topic today** — "Hôm nay con học về..."
2. **Key concept (plain language)** — "Khái niệm chính là..."
3. **Home activity** — "Phụ huynh có thể thử..."
4. **Time needed** — "Chỉ mất khoảng X phút!"

### 11.3 Optional Content (MAY)

- Vocabulary words to practice
- Suggested book/video related to topic
- Cultural connection (if applicable)
- Progress note ("Con đang làm rất tốt ở...")

### 11.4 Template

```markdown
📚 **Hôm nay con học gì?**
[Topic — 1 câu đơn giản]

💡 **Điều quan trọng nhất:**
[Key concept in plain language — no jargon — 2–3 câu]

🏠 **Hoạt động ở nhà:**
[Specific, fun, 5–10 minute activity parents can do with child]
*Chỉ cần [X] phút thôi!*

📊 **Con đang tiến bộ:**
[Optional: Brief positive progress note from AI analytics]

❤️ *Cảm ơn phụ huynh đã đồng hành cùng AvaB!*
```

### 11.5 Anti-patterns for Parent Notes

- ⚠️ Dùng thuật ngữ giáo dục ("Bloom's Taxonomy", "CPA approach")
- ⚠️ Quá dài — phụ huynh bận, sẽ không đọc
- ⚠️ Chỉ nhắc bài tập về nhà — không có connection hoạt động
- ⚠️ Tiêu cực ("Con chưa làm được...") — focus on growth
- ⚠️ Generic template không customize per lesson

### 11.6 Example Parent Note

```
📚 Hôm nay con học gì?
Phép chia — chia đều đồ vật thành các phần bằng nhau.

💡 Điều quan trọng nhất:
Khi chia 12 cái kẹo cho 3 bạn, mỗi bạn được 4 cái. Phép chia 
giúp chúng ta chia đều công bằng. Con đã biết kiểm tra lại 
bằng cách nhân ngược lại: 4 × 3 = 12 ✓

🏠 Hoạt động ở nhà:
Lấy 10–20 đồ vật nhỏ (nút áo, hạt đậu...) và hỏi con: "Chia 
đều cho 2/3/4 người thì mỗi người được mấy?" Chỉ cần 5 phút!

❤️ Cảm ơn phụ huynh đã đồng hành cùng AvaB!
```

---

## 12. ASSESSMENT STANDARD

### 12.1 Seven Dimensions Framework

AvaB đánh giá học sinh theo 7 dimensions, liên tục trong suốt quá trình học:

| # | Dimension | Definition | Weight (Default) |
|---|---|---|---|
| 1 | Knowledge (Kiến thức) | Nắm vững nội dung, facts, concepts | 25% |
| 2 | Skill (Kỹ năng) | Thực hiện đúng kỹ thuật, quy trình | 20% |
| 3 | Thinking (Tư duy) | Phân tích, lý luận, suy luận logic | 20% |
| 4 | Creativity (Sáng tạo) | Tạo ra giải pháp mới, cách tiếp cận độc đáo | 10% |
| 5 | Communication (Giao tiếp) | Trình bày, giải thích rõ ràng | 10% |
| 6 | Problem Solving (Giải quyết VĐ) | Tự chọn chiến lược, persistence | 10% |
| 7 | Confidence (Tự tin) | Tự kiểm tra, không cần gợi ý sớm | 5% |

> Weight có thể điều chỉnh per lesson type (ví dụ: CS lesson tăng Creativity)

### 12.2 Rubric per Dimension

#### Dimension 1: Knowledge
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Giải thích được concept cho người khác, kết nối với kiến thức liên quan |
| 3 | Proficient | Nhớ và áp dụng đúng concept trong context quen thuộc |
| 2 | Developing | Nhớ được một phần, cần gợi ý để áp dụng |
| 1 | Beginning | Chưa nhớ hoặc hiểu sai concept |

#### Dimension 2: Skill
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Thực hiện nhanh, chính xác, không cần nhắc nhở |
| 3 | Proficient | Thực hiện đúng với ít lỗi nhỏ |
| 2 | Developing | Thực hiện được một phần, có lỗi |
| 1 | Beginning | Chưa thực hiện được quy trình |

#### Dimension 3: Thinking
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Phát hiện ra pattern, dự đoán, chứng minh lý luận |
| 3 | Proficient | Có thể so sánh, phân loại, phân tích cơ bản |
| 2 | Developing | Nhận ra rõ ràng nhưng chưa liên kết |
| 1 | Beginning | Tư duy 1 chiều, không phân tích |

#### Dimension 4: Creativity
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Tạo ra giải pháp hoàn toàn mới, độc đáo |
| 3 | Proficient | Có cách tiếp cận mới, kết hợp ý tưởng khác nhau |
| 2 | Developing | Copy pattern với biến đổi nhỏ |
| 1 | Beginning | Chỉ lặp lại những gì đã học |

#### Dimension 5: Communication
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Trình bày rõ, logic, ai cũng hiểu được |
| 3 | Proficient | Giải thích đủ, cơ bản rõ ràng |
| 2 | Developing | Có ý nhưng diễn đạt chưa rõ |
| 1 | Beginning | Không diễn đạt được |

#### Dimension 6: Problem Solving
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Tự chọn chiến lược tối ưu, thử nhiều cách |
| 3 | Proficient | Áp dụng chiến lược đúng, có kiểm tra |
| 2 | Developing | Cần gợi ý chiến lược, không kiểm tra |
| 1 | Beginning | Không biết bắt đầu từ đâu |

#### Dimension 7: Confidence
| Score | Level | Descriptor |
|---|---|---|
| 4 | Advanced | Tự kiểm tra, không cần hint, sửa được lỗi |
| 3 | Proficient | Thử trước khi xin hint, chấp nhận được sai |
| 2 | Developing | Hay xin hint sớm, không muốn thử trước |
| 1 | Beginning | Từ chối làm khi không chắc, anxiety cao |

### 12.3 Formative vs Summative Assessment

| Type | When | Method | Use |
|---|---|---|---|
| Formative | Mỗi exercise (continuous) | Auto-scoring + BKT | Adjust difficulty, hint level |
| Lesson-end | Sau Independent Practice | 5–8 câu auto-scored | Lesson mastery signal |
| Module-end | Sau Module | Mixed assessment | Module completion |
| Summative | Cuối học kỳ | Full test | Reporting |

### 12.4 BKT (Bayesian Knowledge Tracing) Integration

**Key Parameters:**
| Parameter | Description | Default Value |
|---|---|---|
| P(L0) | Prior probability of knowing skill | 0.3 (before lesson) |
| P(T) | Probability of learning from practice | 0.09 |
| P(G) | Probability of guessing correctly | 0.25 (MCQ) |
| P(S) | Probability of slipping (know but wrong) | 0.1 |

**Mastery Thresholds:**
| P(mastery) | Status | Action |
|---|---|---|
| < 0.4 | Not mastered | Remedial content recommended |
| 0.4 – 0.7 | Developing | Continue practice |
| 0.7 – 0.85 | Approaching mastery | Reduce repetition |
| ≥ 0.85 | Mastered | Move to next concept |
| ≥ 0.95 | Advanced | Recommend Challenge |

**BKT Update Rules:**
- MUST: P(mastery) update after every exercise attempt
- MUST: Separate BKT per skill (không phải per lesson)
- SHOULD: Factor in response time (fast correct = higher confidence)
- SHOULD: Decay P(mastery) after 7+ days of inactivity

---

## 13. QA STANDARD — MASTER CHECKLIST

### 13.1 QA Process Overview

```
Author Draft → Self-QA (Author) → Peer Review → Expert Review → Final Approval → Publish
     ↓               ↓                ↓               ↓                ↓
  [Create]     [All MUST pass]   [Content QA]   [Pedagogy QA]   [Tech QA pass]
```

### 13.2 Master QA Checklist (30+ Items)

#### Section A: Metadata & Structure
- [ ] A1. Lesson ID follows correct format [SUBJECT]-[GRADE]-[MODULE]-[SEQ]
- [ ] A2. All required metadata fields are populated
- [ ] A3. Version number is correct (SemVer)
- [ ] A4. Tags are in registered format (category:value)
- [ ] A5. Prerequisites are correctly linked and verified
- [ ] A6. Curriculum alignment documented (Cambridge/Common Core/MOET)
- [ ] A7. All 18 lesson components present in correct order

#### Section B: Learning Objectives
- [ ] B1. Each objective follows [Verb + Content + Condition + Criterion]
- [ ] B2. Verbs are from approved Bloom's verb bank
- [ ] B3. Objectives are measurable and observable
- [ ] B4. Objectives align with Bloom's level stated in metadata
- [ ] B5. 1–5 objectives total (not over)
- [ ] B6. Objectives coverage: all components link back to ≥1 objective

#### Section C: Age Appropriateness
- [ ] C1. Language level matches grade (sentence length, vocabulary)
- [ ] C2. Theory word count within grade limits
- [ ] C3. Maximum 3 new concepts per lesson
- [ ] C4. Cognitive load: max chunks per screen ≤ 4
- [ ] C5. No adult themes, inappropriate content

#### Section D: Knowledge Accuracy
- [ ] D1. All mathematical facts/solutions verified by subject matter expert
- [ ] D2. English content checked by native speaker or certified teacher
- [ ] D3. CS content verified — code works, algorithms correct
- [ ] D4. No contradictions between components (e.g., theory ≠ example)
- [ ] D5. Common Mistakes section lists real mistakes (not invented)

#### Section E: Answer Accuracy
- [ ] E1. All exercise answers verified independently (2-person check)
- [ ] E2. Grading logic correct (partial credit where applicable)
- [ ] E3. Homework answers complete
- [ ] E4. Alternative valid answers documented
- [ ] E5. Explanations match correct answer logic

#### Section F: No Duplicate Content
- [ ] F1. No duplicate questions within lesson
- [ ] F2. No duplicate with other lessons in module (search check)
- [ ] F3. Images are unique (no reuse without metadata update)
- [ ] F4. Story content is original, not lifted from other sources

#### Section G: Illustration Quality
- [ ] G1. Minimum image count per component met
- [ ] G2. Images are age-appropriate and culturally relevant
- [ ] G3. Alt text provided for all images
- [ ] G4. Color contrast ratio ≥ 4.5:1
- [ ] G5. Image size within limits (by type)
- [ ] G6. VN cultural context present where relevant

#### Section H: Cognitive Load Compliance
- [ ] H1. Theory: max 4 new chunks per screen
- [ ] H2. Worked examples: think-aloud format present
- [ ] H3. Exercises: instructions clear, no ambiguity
- [ ] H4. Visual + Text placed adjacently (no split attention)
- [ ] H5. No irrelevant decorative content that distracts

#### Section I: Time Allocation
- [ ] I1. Total lesson time within grade range (see Section 2.3)
- [ ] I2. Each component within duration guideline
- [ ] I3. Homework time appropriate for age
- [ ] I4. Exercises: number appropriate for time allocated

#### Section J: AI Tutor Quality
- [ ] J1. AI Tutor prompt template present for each exercise
- [ ] J2. Hints don't reveal answer at Scaffold Level 1–3
- [ ] J3. Forbidden responses list reviewed
- [ ] J4. Common mistakes fed into AI context
- [ ] J5. Emotional tone warm and age-appropriate

#### Section K: Accessibility
- [ ] K1. Alt text for all images
- [ ] K2. Sufficient color contrast
- [ ] K3. Color not sole differentiator
- [ ] K4. Text size ≥ 14px
- [ ] K5. Touch targets ≥ 44×44px (mobile)
- [ ] K6. Audio descriptions for complex visuals

#### Section L: Teacher & Parent Content
- [ ] L1. Teacher Guide complete (all 10 sections)
- [ ] L2. Parent Note ≤ 150 words
- [ ] L3. Parent Note uses plain, non-technical language
- [ ] L4. Differentiation strategies present (3 tiers)
- [ ] L5. Assessment rubric aligned with 7 dimensions

### 13.3 QA Severity Levels

| Severity | Label | Action Required |
|---|---|---|
| Critical | 🔴 BLOCKER | Cannot publish — must fix |
| High | 🟠 MAJOR | Fix before next review cycle |
| Medium | 🟡 MINOR | Fix in next version |
| Low | 🟢 SUGGESTION | Nice to have, log for backlog |

**Critical (BLOCKER) conditions:**
- Any factual/mathematical error
- Any answer accuracy error
- Missing MUST component
- Inappropriate content for children
- Accessibility failure (alt text, contrast)

---

## 14. JSON DATA MODEL

### 14.1 Full Lesson Schema

```json
{
  "$schema": "https://avab.edu.vn/schemas/lesson/v1.0",
  "lessonId": "MATH-G2-QLD-003",
  "metadata": { "...see Section 1 schema..." },
  "components": [
    {
      "componentId": "MATH-G2-QLD-003-INTRO",
      "type": "introduction",
      "order": 1,
      "content": {
        "text": "Xin chào! Hôm nay chúng ta sẽ học về hình tứ giác...",
        "recallQuestion": "Các bạn còn nhớ hình tam giác có mấy cạnh không?",
        "previewHook": "Hôm nay mình sẽ trả lời: Tại sao cửa sổ thường hình chữ nhật?",
        "mascot": "ava",
        "illustrations": [
          {
            "illustrationId": "ILL-MATH-G2-QLD-003-001",
            "url": "https://cdn.avab.edu.vn/illustrations/...",
            "altText": "Ava bạch tuộc vẫy tay chào với nụ cười thân thiện",
            "type": "mascot",
            "position": "right"
          }
        ]
      },
      "duration": 120,
      "status": "approved"
    },
    {
      "componentId": "MATH-G2-QLD-003-THEORY",
      "type": "theory",
      "order": 5,
      "content": {
        "conceptName": "Hình tứ giác",
        "definition": "Hình tứ giác là hình có 4 cạnh và 4 góc.",
        "cpaPhase": "concrete",
        "bodyText": "...",
        "thinkingTips": [
          "Tứ giác = TỨ (4) + GIÁC (góc). Đếm góc là biết ngay!",
          "Kiểm tra nhanh: 4 cạnh + 4 góc = tứ giác ✓"
        ],
        "commonMistakes": [
          {
            "mistake": "Nghĩ hình thang không phải tứ giác",
            "reason": "Học sinh nhầm tứ giác phải có cạnh bằng nhau",
            "correction": "Tứ giác chỉ cần 4 cạnh — không cần bằng nhau"
          }
        ],
        "realLifeApplication": "Cửa sổ, bảng đen, sách vở đều là tứ giác!",
        "summaryCard": {
          "terms": [
            { "term": "Tứ giác", "definition": "Hình có 4 cạnh, 4 góc" },
            { "term": "Hình vuông", "definition": "Tứ giác có 4 cạnh bằng nhau, 4 góc vuông" }
          ]
        },
        "illustrations": []
      },
      "duration": 600,
      "status": "approved"
    }
  ],
  "exercises": [],
  "homework": {},
  "assessment": {},
  "aiTutorPrompts": [],
  "teacherGuide": {},
  "parentNote": {},
  "qa": {
    "qaStatus": "approved",
    "reviewedBy": "user_456",
    "reviewedAt": "2026-07-01T10:00:00Z",
    "checklistScore": "30/30",
    "blockers": [],
    "suggestions": []
  },
  "analytics": {
    "avgCompletionTime": null,
    "avgScore": null,
    "completionRate": null,
    "mostMissedExercise": null
  }
}
```

### 14.2 Exercise / Question Schema

```json
{
  "$schema": "https://avab.edu.vn/schemas/exercise/v1.0",
  "exerciseId": "EX-MATH-G2-QLD-003-001",
  "lessonId": "MATH-G2-QLD-003",
  "componentType": "guided_practice",
  "order": 1,
  "type": "MCQ",
  "bloomsLevel": "remember",
  "difficulty": "easy",
  "points": 1,
  "timeLimit": 30,
  "content": {
    "stem": "Hình nào dưới đây là tứ giác?",
    "stemImage": null,
    "options": [
      { "id": "A", "text": "Hình tròn", "image": "circle.png" },
      { "id": "B", "text": "Hình tam giác", "image": "triangle.png" },
      { "id": "C", "text": "Hình chữ nhật", "image": "rectangle.png" },
      { "id": "D", "text": "Hình ngũ giác", "image": "pentagon.png" }
    ],
    "correctAnswer": "C",
    "explanation": "Hình chữ nhật có 4 cạnh và 4 góc — đó là tứ giác!",
    "hint": "Hãy đếm số cạnh của mỗi hình nhé!",
    "gradingLogic": "binary",
    "aiTutorContext": {
      "scaffoldL1": "Em đếm số cạnh của từng hình thử xem?",
      "scaffoldL2": "Tứ giác cần bao nhiêu cạnh? Hình nào có đúng số đó?",
      "scaffoldL3": "Nhớ không: tứ giác = 4 cạnh. Đếm từng hình một nhé!",
      "scaffoldL4": "Hình tròn: 0 cạnh. Tam giác: 3 cạnh. Hình chữ nhật: ...",
      "scaffoldL5": "Đáp án là C - Hình chữ nhật vì có 4 cạnh và 4 góc."
    }
  },
  "metadata": {
    "skill": "shape_recognition",
    "tags": ["quadrilateral", "shapes", "G2"],
    "createdAt": "2026-06-15T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### 14.3 Homework Schema

```json
{
  "homeworkId": "HW-MATH-G2-QLD-003",
  "lessonId": "MATH-G2-QLD-003",
  "grade": 2,
  "estimatedTime": 15,
  "dueHours": 24,
  "sections": [
    {
      "sectionId": "review",
      "name": "Ôn tập",
      "description": "Từ các bài trước",
      "exercises": ["EX-MATH-G2-NUM-015-003", "EX-MATH-G2-GEO-008-001"]
    },
    {
      "sectionId": "new",
      "name": "Luyện tập",
      "description": "Bài hôm nay",
      "exercises": ["HW-EX-001", "HW-EX-002", "HW-EX-003"]
    },
    {
      "sectionId": "challenge",
      "name": "Thử thách",
      "optional": true,
      "bonusPoints": 5,
      "exercises": ["HW-EX-004"]
    }
  ],
  "answersReleasePolicy": "after_submission",
  "solutionsReleasePolicy": "after_answers_viewed"
}
```

### 14.4 Assessment Schema

```json
{
  "assessmentId": "ASS-MATH-G2-QLD-003",
  "lessonId": "MATH-G2-QLD-003",
  "type": "formative",
  "dimensions": {
    "knowledge": { "weight": 0.25, "maxScore": 4 },
    "skill": { "weight": 0.20, "maxScore": 4 },
    "thinking": { "weight": 0.20, "maxScore": 4 },
    "creativity": { "weight": 0.10, "maxScore": 4 },
    "communication": { "weight": 0.10, "maxScore": 4 },
    "problemSolving": { "weight": 0.10, "maxScore": 4 },
    "confidence": { "weight": 0.05, "maxScore": 4 }
  },
  "bktSkills": ["quadrilateral_recognition", "shape_classification"],
  "masteryThreshold": 0.85,
  "continuousTracking": true
}
```

### 14.5 AI Tutor Prompt Schema

```json
{
  "promptId": "ATP-MATH-G2-QLD-003-001",
  "lessonId": "MATH-G2-QLD-003",
  "exerciseId": "EX-MATH-G2-QLD-003-001",
  "systemContext": {
    "subject": "MATH",
    "grade": 2,
    "ageRange": { "min": 7, "max": 8 },
    "language": "vi",
    "concept": "Hình tứ giác",
    "correctAnswer": "C",
    "commonMistakes": [
      "Không đếm cạnh — đoán theo hình dạng tổng thể",
      "Nhầm tam giác với tứ giác"
    ]
  },
  "scaffoldingPrompts": {
    "level1": "Em đang nghĩ về điều gì? Bài hỏi mình tìm hình như thế nào?",
    "level2": "Gợi ý: Em hãy đếm số cạnh của mỗi hình trước nhé!",
    "level3": "Tứ giác = 4 cạnh. Giờ em thử đếm từng hình xem hình nào có 4 cạnh?",
    "level4": "Hình tròn: 0 cạnh. Hình tam giác: 3 cạnh. Hình ngũ giác: 5 cạnh. Hình chữ nhật: ... cạnh?",
    "level5": "Đáp án là C - Hình chữ nhật! Vì nó có 4 cạnh và 4 góc. Đó chính xác là tứ giác!"
  },
  "emotionalResponses": {
    "frustration": "Bài này thú vị lắm mà! Cứ bình tĩnh đếm từng hình một nhé, không vội đâu!",
    "confidence": "Em giỏi quá! Muốn thử câu khó hơn không?",
    "celebration": "Chính xác rồi! 🎉 Em nhớ mẹo đếm cạnh rồi đó!"
  }
}
```

### 14.6 Illustration Schema

```json
{
  "illustrationId": "ILL-MATH-G2-QLD-003-001",
  "lessonId": "MATH-G2-QLD-003",
  "componentType": "theory",
  "type": "concept_diagram",
  "description": "Sơ đồ so sánh các loại tứ giác: vuông, chữ nhật, thoi, thang",
  "altText": "Bốn hình tứ giác được đặt cạnh nhau với tên gọi phía dưới: hình vuông, hình chữ nhật, hình thoi, hình thang",
  "style": "flat_illustration",
  "colorPalette": ["#4A90E2", "#7ED321", "#F5A623", "#9B59B6"],
  "dimensions": {
    "width": 800,
    "height": 400
  },
  "format": "svg",
  "fileUrl": "https://cdn.avab.edu.vn/illustrations/MATH-G2-QLD-003-001.svg",
  "thumbnailUrl": "https://cdn.avab.edu.vn/thumbnails/MATH-G2-QLD-003-001.webp",
  "culturalElements": [],
  "accessibilityNotes": "Color-coded shapes with labels; patterns used in addition to color",
  "version": "1.0.0",
  "createdBy": "designer_123",
  "createdAt": "2026-06-10T00:00:00Z"
}
```

---

## 15. DATABASE DESIGN

### 15.1 Entity Relationship Diagram (Text-based ERD)

```
┌──────────────┐       ┌─────────────────┐
│   Lesson     │───┐   │ LessonComponent │
│              │   └──►│                 │
│ lessonId(PK) │       │ componentId(PK) │
│ title        │       │ lessonId(FK)    │
│ subject      │       │ type            │
│ grade        │◄──┐   │ order           │
│ moduleCode   │   │   │ content(JSON)   │
│ status       │   │   │ duration        │
│ version      │   │   └─────────────────┘
│ authorId(FK) │   │
│ reviewerId   │   │   ┌─────────────────┐
│ ...metadata  │   └───│ Exercise        │
└──────────────┘   │   │                 │
       │           │   │ exerciseId(PK)  │
       │           │   │ lessonId(FK)    │
       │           │   │ componentType   │
       ▼           │   │ type (enum)     │
┌──────────────┐   │   │ content(JSON)   │
│  Homework    │   │   │ difficulty      │
│              │   │   │ bloomsLevel     │
│ homeworkId   │   │   │ points          │
│ (PK)         │   │   │ gradingLogic    │
│ lessonId(FK) │   │   └─────────────────┘
│ sections     │   │
│ (JSON)       │   │   ┌─────────────────┐
│ dueHours     │   └───│ Assessment      │
│ answersPolicy│       │                 │
└──────────────┘       │ assessmentId(PK)│
                       │ lessonId(FK)    │
                       │ type            │
┌──────────────┐       │ dimensions(JSON)│
│ TeacherGuide │       │ bktSkills(JSON) │
│              │       └─────────────────┘
│ guideId(PK)  │
│ lessonId(FK) │       ┌─────────────────┐
│ content(JSON)│       │  Illustration   │
│ version      │       │                 │
└──────────────┘       │ illustrationId  │
                       │ (PK)            │
┌──────────────┐       │ lessonId(FK)    │
│  ParentNote  │       │ componentType   │
│              │       │ type            │
│ noteId(PK)   │       │ fileUrl         │
│ lessonId(FK) │       │ altText         │
│ content(JSON)│       │ dimensions(JSON)│
│ wordCount    │       └─────────────────┘
└──────────────┘
                       ┌─────────────────┐
┌──────────────┐       │   AIPrompt      │
│   QALog      │       │                 │
│              │       │ promptId(PK)    │
│ qaLogId(PK)  │       │ lessonId(FK)    │
│ lessonId(FK) │       │ exerciseId(FK)  │
│ reviewerId   │       │ systemContext   │
│ qaStatus     │       │ (JSON)          │
│ checklist    │       │ scaffolding     │
│ (JSON)       │       │ (JSON)          │
│ blockers     │       │ emotional(JSON) │
│ (JSON)       │       └─────────────────┘
│ reviewedAt   │
└──────────────┘       ┌─────────────────┐
                       │    Version      │
                       │                 │
                       │ versionId(PK)   │
                       │ lessonId(FK)    │
                       │ version         │
                       │ changeLog(JSON) │
                       │ snapshot(JSON)  │
                       │ publishedAt     │
                       └─────────────────┘
```

### 15.2 Table Definitions

#### Table: lessons
```sql
CREATE TABLE lessons (
    lesson_id        VARCHAR(30) PRIMARY KEY,     -- e.g., MATH-G2-QLD-003
    title            VARCHAR(80) NOT NULL,
    title_en         VARCHAR(80),
    subject          ENUM('MATH','ENG','CS') NOT NULL,
    grade            TINYINT NOT NULL CHECK (grade BETWEEN 1 AND 9),
    module_code      VARCHAR(4) NOT NULL,
    sequence         SMALLINT NOT NULL,
    version          VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    status           ENUM('draft','review','approved','published','archived') NOT NULL DEFAULT 'draft',
    age_min          TINYINT NOT NULL,
    age_max          TINYINT NOT NULL,
    estimated_duration SMALLINT NOT NULL,
    blooms_level     ENUM('remember','understand','apply','analyze','evaluate','create') NOT NULL,
    solo_level       ENUM('prestructural','unistructural','multistructural','relational','extended_abstract') NOT NULL,
    difficulty       ENUM('beginner','intermediate','advanced') NOT NULL,
    language         ENUM('vi','en','bilingual') NOT NULL,
    keywords         JSON NOT NULL,
    tags             JSON,
    curriculum_alignment JSON,
    thumbnail_url    VARCHAR(500),
    author_id        VARCHAR(50) NOT NULL,
    reviewer_id      VARCHAR(50),
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at     DATETIME,
    UNIQUE KEY uk_module_seq (subject, grade, module_code, sequence),
    INDEX idx_subject_grade (subject, grade),
    INDEX idx_status (status),
    INDEX idx_module (module_code)
);

#### Table: lesson_components
```sql
CREATE TABLE lesson_components (
    component_id     VARCHAR(60) PRIMARY KEY,     -- e.g., MATH-G2-QLD-003-THEORY
    lesson_id        VARCHAR(30) NOT NULL,
    type             ENUM('introduction','warmup','motivation','story','theory',
                         'visual_explanation','worked_examples','guided_practice',
                         'independent_practice','challenge','mini_game','reflection',
                         'summary','homework','parent_note','teacher_note',
                         'ai_tutor_prompt','assessment') NOT NULL,
    component_order  TINYINT NOT NULL,
    content          JSON NOT NULL,
    duration_seconds SMALLINT,
    status           ENUM('draft','approved') NOT NULL DEFAULT 'draft',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_lesson_order (lesson_id, component_order)
);
```

#### Table: exercises
```sql
CREATE TABLE exercises (
    exercise_id      VARCHAR(60) PRIMARY KEY,     -- e.g., EX-MATH-G2-QLD-003-001
    lesson_id        VARCHAR(30) NOT NULL,
    component_type   ENUM('guided_practice','independent_practice','challenge',
                         'mini_game','homework','assessment') NOT NULL,
    exercise_order   TINYINT NOT NULL,
    type             ENUM('MCQ','TF','FIB','MAT','SRT','CLS','PAT','SEQ','NUM',
                         'TYP','SPK','LST','DRG','DRW','COD','OPN','MMP','PZL',
                         'PRJ','RJL','TML','MSL','STM','WRD') NOT NULL,
    content          JSON NOT NULL,               -- stem, options, correctAnswer, etc.
    blooms_level     ENUM('remember','understand','apply','analyze','evaluate','create') NOT NULL,
    difficulty       ENUM('easy','medium','hard') NOT NULL,
    points           TINYINT NOT NULL DEFAULT 1,
    time_limit_sec   SMALLINT,
    grading_logic    ENUM('binary','partial','rubric','ai_assessed') NOT NULL,
    ai_tutor_context JSON,
    tags             JSON,
    version          VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_lesson_component (lesson_id, component_type),
    INDEX idx_type (type),
    INDEX idx_difficulty (difficulty)
);
```

#### Table: homework
```sql
CREATE TABLE homework (
    homework_id        VARCHAR(50) PRIMARY KEY,
    lesson_id          VARCHAR(30) NOT NULL,
    grade              TINYINT NOT NULL,
    estimated_time_min TINYINT NOT NULL,
    due_hours          SMALLINT NOT NULL DEFAULT 24,
    sections           JSON NOT NULL,
    answers_policy     ENUM('after_submission','after_due_date','immediate') NOT NULL DEFAULT 'after_submission',
    solutions_policy   ENUM('after_answers','after_due_date','never') NOT NULL DEFAULT 'after_answers',
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);
```

#### Table: assessments
```sql
CREATE TABLE assessments (
    assessment_id      VARCHAR(50) PRIMARY KEY,
    lesson_id          VARCHAR(30) NOT NULL,
    type               ENUM('formative','lesson_end','module_end','summative') NOT NULL,
    dimensions         JSON NOT NULL,             -- weights and maxScores
    bkt_skills         JSON,                      -- skill codes for BKT tracking
    mastery_threshold  DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    continuous         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);
```

#### Table: illustrations
```sql
CREATE TABLE illustrations (
    illustration_id   VARCHAR(60) PRIMARY KEY,
    lesson_id         VARCHAR(30) NOT NULL,
    component_type    VARCHAR(30) NOT NULL,
    illustration_type ENUM('concept_diagram','character','context','step_visual',
                          'summary_card','game_asset','background') NOT NULL,
    description       TEXT NOT NULL,
    alt_text          VARCHAR(300) NOT NULL,
    style             VARCHAR(30) NOT NULL DEFAULT 'flat_illustration',
    file_url          VARCHAR(500) NOT NULL,
    thumbnail_url     VARCHAR(500),
    file_format       ENUM('svg','png','webp','gif') NOT NULL,
    width_px          SMALLINT,
    height_px         SMALLINT,
    file_size_kb      SMALLINT,
    color_palette     JSON,
    cultural_elements JSON,
    accessibility_notes TEXT,
    version           VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    created_by        VARCHAR(50) NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id),
    INDEX idx_component (component_type)
);
```

#### Table: teacher_guides
```sql
CREATE TABLE teacher_guides (
    guide_id          VARCHAR(50) PRIMARY KEY,
    lesson_id         VARCHAR(30) NOT NULL UNIQUE,
    content           JSON NOT NULL,             -- all 10 sections
    version           VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    author_id         VARCHAR(50) NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);
```

#### Table: parent_notes
```sql
CREATE TABLE parent_notes (
    note_id           VARCHAR(50) PRIMARY KEY,
    lesson_id         VARCHAR(30) NOT NULL UNIQUE,
    content_vi        TEXT NOT NULL,             -- Vietnamese content
    content_en        TEXT,                      -- Optional English
    word_count        TINYINT NOT NULL,
    topic_summary     VARCHAR(200) NOT NULL,
    home_activity     TEXT NOT NULL,
    time_needed_min   TINYINT NOT NULL,
    version           VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);
```

#### Table: ai_prompts
```sql
CREATE TABLE ai_prompts (
    prompt_id         VARCHAR(60) PRIMARY KEY,
    lesson_id         VARCHAR(30) NOT NULL,
    exercise_id       VARCHAR(60),
    component_type    VARCHAR(30) NOT NULL,
    system_context    JSON NOT NULL,
    scaffolding_prompts JSON NOT NULL,           -- level1..level5
    emotional_responses JSON NOT NULL,
    forbidden_patterns JSON,
    version           VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE SET NULL,
    INDEX idx_lesson (lesson_id),
    INDEX idx_exercise (exercise_id)
);
```

#### Table: qa_logs
```sql
CREATE TABLE qa_logs (
    qa_log_id         VARCHAR(50) PRIMARY KEY,
    lesson_id         VARCHAR(30) NOT NULL,
    lesson_version    VARCHAR(10) NOT NULL,
    reviewer_id       VARCHAR(50) NOT NULL,
    qa_status         ENUM('pending','in_review','approved','rejected','revision_needed') NOT NULL,
    checklist         JSON NOT NULL,             -- all 30+ items with pass/fail/NA
    blockers          JSON,                      -- critical issues
    major_issues      JSON,                      -- high severity
    suggestions       JSON,                      -- low severity
    score             VARCHAR(10),               -- e.g., '28/30'
    notes             TEXT,
    reviewed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_status (qa_status)
);
```

#### Table: lesson_versions
```sql
CREATE TABLE lesson_versions (
    version_id        VARCHAR(60) PRIMARY KEY,   -- lesson_id + '_' + version
    lesson_id         VARCHAR(30) NOT NULL,
    version           VARCHAR(10) NOT NULL,
    change_log        JSON NOT NULL,             -- what changed
    snapshot          JSON NOT NULL,             -- full lesson state at this version
    published_by      VARCHAR(50),
    published_at      DATETIME,
    archived_at       DATETIME,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id),
    UNIQUE KEY uk_lesson_version (lesson_id, version),
    INDEX idx_lesson (lesson_id)
);
```

#### Table: student_responses (Analytics)
```sql
CREATE TABLE student_responses (
    response_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id        VARCHAR(50) NOT NULL,
    exercise_id       VARCHAR(60) NOT NULL,
    lesson_id         VARCHAR(30) NOT NULL,
    attempt_number    TINYINT NOT NULL DEFAULT 1,
    student_answer    JSON NOT NULL,
    is_correct        BOOLEAN NOT NULL,
    score_earned      DECIMAL(5,2) NOT NULL,
    time_taken_sec    SMALLINT,
    scaffold_level_used TINYINT,
    hints_used        TINYINT NOT NULL DEFAULT 0,
    bkt_before        DECIMAL(4,3),              -- P(mastery) before this attempt
    bkt_after         DECIMAL(4,3),              -- P(mastery) after this attempt
    submitted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_lesson (student_id, lesson_id),
    INDEX idx_exercise (exercise_id),
    INDEX idx_submitted (submitted_at)
);
```

---

## 16. ADMIN UI DESIGN

### 16.1 Lesson List View

```
╔════════════════════════════════════════════════════════════════════════╗
║  AvaB Admin — Lesson Manager                          [+ New Lesson]  ║
╠════════════════════════════════════════════════════════════════════════╣
║  🔍 Search lessons...    [Subject▼] [Grade▼] [Status▼] [Module▼]      ║
║                                                       [Reset Filters] ║
╠════════════════════════════════════════════════════════════════════════╣
║  Showing 1–20 of 247 lessons                  [Sort: Updated ▼]       ║
╠═══════════╦══════════════════════╦══════╦══════╦═══════════╦══════════╣
║  ID       ║ Title                ║ Subj ║Grade ║ Status    ║ Actions  ║
╠═══════════╬══════════════════════╬══════╬══════╬═══════════╬══════════╣
║MATH-G2-   ║ Hình Tứ Giác và      ║ MATH ║  G2  ║ ● PUBLISHED║ Edit    ║
║QLD-003    ║ Các Loại Đặc Biệt    ║      ║      ║           ║ Clone   ║
║           ║                      ║      ║      ║           ║ Archive ║
╠═══════════╬══════════════════════╬══════╬══════╬═══════════╬══════════╣
║ENG-G1-    ║ Short Vowels: The    ║ ENG  ║  G1  ║ ◐ REVIEW  ║ Edit    ║
║PHO-012    ║ Magic of A, E, I     ║      ║      ║           ║ View QA ║
╠═══════════╬══════════════════════╬══════╬══════╬═══════════╬══════════╣
║CS-G2-     ║ Thuật Toán: Bước     ║  CS  ║  G2  ║ ○ DRAFT   ║ Edit    ║
║ALG-005    ║ Theo Bước            ║      ║      ║           ║ Preview ║
╠═══════════╩══════════════════════╩══════╩══════╩═══════════╩══════════╣
║  [← Prev]                    Page 1 of 13                  [Next →]  ║
╚════════════════════════════════════════════════════════════════════════╝

Status Legend:
● PUBLISHED  ◐ REVIEW  ○ DRAFT  ⊘ ARCHIVED  ✓ APPROVED
```

### 16.2 Lesson Editor — Main Form

```
╔════════════════════════════════════════════════════════════════════════╗
║  Edit Lesson: MATH-G2-QLD-003                  [Save Draft] [Preview] ║
╠══════════════╦═════════════════════════════════════════════════════════╣
║  NAVIGATION  ║  LESSON METADATA                                        ║
║──────────────║─────────────────────────────────────────────────────────║
║ ▶ Metadata   ║  Lesson ID: [MATH-G2-QLD-003          ] (locked)        ║
║   Objectives ║  Title (VN): [Hình Tứ Giác và Các Loại Đặc Biệt      ] ║
║──────────────║  Title (EN): [Quadrilaterals and Special Types         ] ║
║ COMPONENTS   ║                                                          ║
║  01 Intro    ║  Subject: [MATH ▼]  Grade: [G2 ▼]  Module: [QLD ▼]     ║
║  02 Warm-up  ║  Sequence: [003]  Difficulty: [Intermediate ▼]          ║
║  03 Motivat. ║  Language: [Vietnamese ▼]                               ║
║  04 Story    ║                                                          ║
║▶ 05 Theory   ║  Estimated Duration: [64] minutes                       ║
║  06 Visual   ║  Age Range: Min [7] Max [8]                             ║
║  07 Examples ║                                                          ║
║  08 Guided   ║  Bloom's Level: [Understand ▼]                          ║
║  09 Indep.   ║  SOLO Level:    [Multistructural ▼]                     ║
║  10 Challeng ║                                                          ║
║  11 MiniGame ║  Keywords: [quadrilateral] [shapes] [geometry] [+ Add]  ║
║  12 Reflect. ║  Tags: [topic:shapes] [skill:classification] [+ Add]    ║
║  13 Summary  ║                                                          ║
║──────────────║  Curriculum Alignment:                                   ║
║ SUPPORT      ║  Cambridge: [Cambridge Primary Maths Stage 2 — Shape]   ║
║  Teacher     ║  Common Core: [2.G.A.1]                                 ║
║  Parent Note ║  Vietnam MOET: [Toán 2, Chủ đề Hình học]                ║
║  AI Prompts  ║                                                          ║
║  QA Check    ║  Prerequisites:                                          ║
║──────────────║  [MATH-G2-GEO-010] [MATH-G1-GEO-008]  [+ Add]          ║
║ VERSIONS     ║                                                          ║
║  v1.0.0 ●   ║                              [Save Draft] [Submit QA]   ║
║  v0.9.0     ║                                                          ║
╚══════════════╩═════════════════════════════════════════════════════════╝
```

### 16.3 Component Editor (Theory Example)

```
╔════════════════════════════════════════════════════════════════════════╗
║  Component Editor: Theory                    [Preview] [AI Generate]  ║
╠════════════════════════════════════════════════════════════════════════╣
║  Concept Name: [Hình tứ giác                                        ]  ║
║                                                                        ║
║  CPA Phase: [○ Concrete  ● Pictorial  ○ Abstract]                     ║
║                                                                        ║
║  Definition:                                                           ║
║  ┌──────────────────────────────────────────────────────────────────┐  ║
║  │ Hình tứ giác là hình có 4 cạnh và 4 góc.                        │  ║
║  └──────────────────────────────────────────────────────────────────┘  ║
║                                                                        ║
║  Body Text (Rich Editor):                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐  ║
║  │ [B] [I] [U] [H1] [H2] [List] [Table] [Image] [Tip] [Mistake]   │  ║
║  │──────────────────────────────────────────────────────────────────│  ║
║  │ Nhìn xung quanh lớp học, em thấy cửa sổ, bảng đen, và sách...  │  ║
║  │                                                                  │  ║
║  └──────────────────────────────────────────────────────────────────┘  ║
║  Word count: 147 / 200 (G2 max)  ✅                                    ║
║                                                                        ║
║  Thinking Tips (max 3):                                                ║
║  [1] [Tứ giác = TỨ(4) + GIÁC(góc). Đếm góc là biết ngay!          ]  ║
║  [2] [Kiểm tra nhanh: 4 cạnh + 4 góc = tứ giác ✓                  ]  ║
║  [3] [                                               ] (optional)     ║
║                                                                        ║
║  Common Mistakes:                             [+ Add Mistake]          ║
║  ┌──────────────────┬─────────────────┬────────────────────┐          ║
║  │ Mistake          │ Why It Happens  │ Correct Approach   │          ║
║  ├──────────────────┼─────────────────┼────────────────────┤          ║
║  │ [Nghĩ hình thang ] [Nhầm tứ giác  ] [Tứ giác chỉ cần  ] │ [🗑]   ║
║  │ không phải TG    ] cần cạnh bằng ] 4 cạnh             ] │          ║
║  └──────────────────┴─────────────────┴────────────────────┘          ║
║                                                                        ║
║  Real-life Application:                                                ║
║  [Cửa sổ, bảng đen, sách vở đều là tứ giác!                       ]  ║
║                                                                        ║
║  Illustrations: [ILL-001.svg  ×] [ILL-002.svg  ×] [+ Upload/Link]    ║
║                                                                        ║
║  Duration (seconds): [600]                                             ║
║                                              [Save] [Preview Component]║
╚════════════════════════════════════════════════════════════════════════╝
```

### 16.4 Preview Mode

```
╔════════════════════════════════════════════════════════════════════════╗
║  PREVIEW MODE  [← Back to Edit]  Device: [Desktop▼] [Tablet] [Mobile] ║
╠════════════════════════════════════════════════════════════════════════╣
║  Navigate: [Intro] [Warm-up] [Theory ●] [Examples] [Practice] [...]   ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║     ╔═══════════════════════════════════════════╗                      ║
║     ║   [Student-facing rendered lesson view]   ║                      ║
║     ║   Exact as student would see it           ║                      ║
║     ║                                           ║                      ║
║     ║  🔷 Hình Tứ Giác                          ║                      ║
║     ║                                           ║                      ║
║     ║  [Illustration: 4 shapes comparison]      ║                      ║
║     ║                                           ║                      ║
║     ║  Hình tứ giác là hình có 4 cạnh...        ║                      ║
║     ╚═══════════════════════════════════════════╝                      ║
║                                                                        ║
║  QA Warnings (Preview): ⚠️ 2 images missing alt text                  ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 16.5 AI Generate / Regenerate

```
╔════════════════════════════════════════════════════════════════════════╗
║  🤖 AI Lesson Generator                                                ║
╠════════════════════════════════════════════════════════════════════════╣
║  Generate for: MATH-G2-QLD-003 — Hình Tứ Giác                        ║
║                                                                        ║
║  Select components to generate:                                        ║
║  [✓] Theory Text        [✓] Worked Examples    [✓] Exercises (5)      ║
║  [✓] Thinking Tips      [ ] Parent Note        [✓] AI Prompts         ║
║  [ ] Teacher Guide      [ ] Homework                                   ║
║                                                                        ║
║  Generation Settings:                                                  ║
║  Tone:          [Friendly & Encouraging ▼]                            ║
║  Cultural refs: [Vietnamese context ▼]                                ║
║  Bloom's focus: [Understand / Apply ▼]                                ║
║  Difficulty:    [Intermediate ▼]                                       ║
║                                                                        ║
║  ⚠️  AI-generated content requires human QA review before publish.    ║
║                                                                        ║
║              [Cancel]          [Generate Selected ▶]                  ║
╚════════════════════════════════════════════════════════════════════════╝

--- After generation ---

╔════════════════════════════════════════════════════════════════════════╗
║  Generation Complete ✅                                                ║
║                                                                        ║
║  Generated:                                                            ║
║  ✅ Theory Text (147 words — within G2 limit)                          ║
║  ✅ Worked Examples (3 examples)                                        ║
║  ✅ 5 Exercises (2 MCQ, 1 MAT, 1 SRT, 1 OPN)                          ║
║  ✅ Thinking Tips (2 tips)                                              ║
║  ✅ AI Prompts (5 scaffolding levels per exercise)                     ║
║                                                                        ║
║  ⚠️  Review needed: Open Question rubric needs human review           ║
║                                                                        ║
║  [Review Generated Content] [Regenerate Theory Only] [Accept All]     ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 16.6 Version Control UI

```
╔════════════════════════════════════════════════════════════════════════╗
║  Version History: MATH-G2-QLD-003                                     ║
╠════════════════════════════════════════════════════════════════════════╣
║  Version  │ Date            │ Author      │ Status      │ Actions      ║
║───────────┼─────────────────┼─────────────┼─────────────┼─────────────║
║  1.2.0  ● │ 2026-07-03      │ Nguyen Van A│ PUBLISHED   │ [View]       ║
║           │                 │             │             │ [Rollback]   ║
║───────────┼─────────────────┼─────────────┼─────────────┼─────────────║
║  1.1.0    │ 2026-06-15      │ Tran Thi B  │ ARCHIVED    │ [View]       ║
║           │                 │             │             │ [Compare]    ║
║───────────┼─────────────────┼─────────────┼─────────────┼─────────────║
║  1.0.0    │ 2026-05-20      │ Nguyen Van A│ ARCHIVED    │ [View]       ║
╠════════════════════════════════════════════════════════════════════════╣
║  Change Log (v1.2.0):                                                  ║
║  • Updated Theory: Added hình thang example (QA feedback)             ║
║  • Fixed Answer: Exercise 3 option B corrected                         ║
║  • Added Parent Note activity section                                  ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 16.7 Publish Workflow UI

```
╔════════════════════════════════════════════════════════════════════════╗
║  Publish Workflow: MATH-G2-QLD-003                                    ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  STEP 1: Author Draft              ✅ COMPLETE (2026-06-10)           ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 2: Author Self-QA            ✅ COMPLETE (28/30 items)          ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 3: Peer Content Review       ✅ APPROVED (2026-06-20)           ║
║          Reviewer: Nguyen Thi C    Notes: Minor fixes applied         ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 4: Expert Pedagogy Review    ✅ APPROVED (2026-06-28)           ║
║          Reviewer: Dr. Le Van D    Notes: CPA well-implemented        ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 5: QA Master Checklist       ✅ PASSED (30/30) (2026-07-01)    ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 6: Technical Review          ✅ PASSED — JSON valid, DB synced  ║
║  ─────────────────────────────────────────────────────────            ║
║  STEP 7: PUBLISH ◄                 ⬤ READY TO PUBLISH                ║
║                                                                        ║
║  Publish Target: [Production ▼]    Schedule: [Immediate ▼]            ║
║                                                                        ║
║              [Cancel]              [🚀 Publish Now]                    ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 16.8 QA Checklist View

```
╔════════════════════════════════════════════════════════════════════════╗
║  QA Checklist: MATH-G2-QLD-003 v1.2.0              Score: 29/30 ✅    ║
╠════════════════════════════════════════════════════════════════════════╣
║  Reviewer: Nguyen Thi C                    Date: 2026-07-01            ║
╠════════════════════════════════════════════════════════════════════════╣
║  Section A: Metadata & Structure                          [7/7 ✅]    ║
║  [✅] A1. Lesson ID format correct                                     ║
║  [✅] A2. All required metadata fields populated                       ║
║  [✅] A3. Version number correct                                       ║
║  [✅] A4. Tags in registered format                                    ║
║  [✅] A5. Prerequisites verified                                       ║
║  [✅] A6. Curriculum alignment documented                              ║
║  [✅] A7. All 18 components present in order                          ║
╠════════════════════════════════════════════════════════════════════════╣
║  Section D: Knowledge Accuracy                            [4/5 ⚠️]   ║
║  [✅] D1. Math facts verified                                          ║
║  [✅] D2. English content checked                                      ║
║  [✅] D3. CS content verified (N/A)                                   ║
║  [⚠️] D4. Contradiction found: Theory says "4 loại" but examples     ║
║          show only 3 loại — MINOR, fix in next version                ║
║  [✅] D5. Common Mistakes are real                                     ║
╠════════════════════════════════════════════════════════════════════════╣
║  [Show All Sections]              [Download Report PDF] [Approve]     ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 17. WORKFLOW DIAGRAM

### 17.1 End-to-End Lesson Production Workflow

```
╔══════════════════════════════════════════════════════════════════════════╗
║             AvaB LESSON PRODUCTION WORKFLOW v1.0                        ║
╚══════════════════════════════════════════════════════════════════════════╝

┌─────────────────┐
│  1. CURRICULUM  │
│  PLANNING       │
│                 │
│ • Module scope  │
│ • Lesson map    │
│ • Objectives    │
│ • Standards     │
│   alignment     │
└────────┬────────┘
         │ Approved Lesson Spec
         ▼
┌─────────────────┐
│  2. LESSON      │
│  DESIGN         │
│                 │
│ • Create ID     │
│ • Metadata fill │
│ • Objectives    │
│   write (Bloom) │
│ • Prerequisite  │
│   mapping       │
└────────┬────────┘
         │ Lesson Shell
         ▼
┌─────────────────┐     ┌──────────────────┐
│  3. THEORY      │────►│  AI ASSIST:       │
│  DEVELOPMENT    │     │  Draft generation │
│                 │◄────│  (human reviews)  │
│ • CPA sequence  │     └──────────────────┘
│ • Definition    │
│ • Examples      │
│ • Tips (≤3)     │
│ • Common errs   │
│ • Real-life app │
│ • Summary card  │
└────────┬────────┘
         │ Reviewed Theory
         ▼
┌─────────────────┐
│  4. EXERCISE    │
│  DEVELOPMENT    │
│                 │
│ • Select types  │
│   from taxonomy │
│ • Write items   │
│ • Verify answers│
│ • Set grading   │
│ • Write hints   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. HOMEWORK    │
│  DESIGN         │
│                 │
│ • Spaced rep.   │
│   selection     │
│ • Review:New:   │
│   Challenge mix │
│ • Solution write│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  6. ILLUSTRATION│────►│  Design Team:     │
│  PRODUCTION     │     │  Flat illustration│
│                 │◄────│  VN cultural ctx  │
│ • Art direction │     │  Accessibility    │
│ • Alt text      │     └──────────────────┘
│ • Format/resize │
│ • Color check   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  7. AI PROMPT   │
│  ENGINEERING    │
│                 │
│ • System ctx    │
│ • Scaffold L1–5 │
│ • Forbidden list│
│ • Emotional resp│
│ • Test prompts  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  8. TEACHER     │
│  GUIDE          │
│                 │
│ • All 10 section│
│ • Misconceptions│
│ • Differentiation│
│ • Rubric        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  9. PARENT      │
│  NOTE           │
│                 │
│ • ≤150 words    │
│ • Plain language│
│ • Home activity │
│ • Topic summary │
└────────┬────────┘
         │ Complete Lesson Package
         ▼
┌─────────────────────────────────────────────────────┐
│  10. QA REVIEW                                       │
│                                                      │
│  ┌──────────────┐    ┌─────────────┐                │
│  │ Author       │    │ QA Checklist│                │
│  │ Self-QA      │───►│ 30+ items   │                │
│  └──────────────┘    └──────┬──────┘                │
│                             │                        │
│          ┌──────────────────┼──────────────────┐    │
│          ▼                  ▼                  ▼    │
│  [BLOCKERS found]   [MAJOR issues]   [PASS ✅]      │
│          │                  │                  │    │
│          ▼                  ▼                  ▼    │
│  Return to Author   Fix & Re-review   Approve        │
└─────────────────────────────┬───────────────────────┘
                              │ QA Approved
                              ▼
┌─────────────────────────────────────────────────────┐
│  11. PUBLISH                                         │
│                                                      │
│  • Version tag (SemVer)                             │
│  • Status → PUBLISHED                               │
│  • CDN deploy (illustrations)                       │
│  • LMS content sync                                 │
│  • Notification: teachers notified                  │
└─────────────────────────────┬───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│  12. LMS (Learning Management System)                │
│                                                      │
│  • Lesson available to students                     │
│  • AI Tutor activated                               │
│  • BKT tracking begins                              │
│  • Homework scheduler activated                     │
│  • Parent note queue activated                      │
└─────────────────────────────┬───────────────────────┘
                              │ Student interactions begin
                              ▼
┌─────────────────────────────────────────────────────┐
│  13. ANALYTICS                                       │
│                                                      │
│  Real-time dashboards:                              │
│  • Completion rate per component                    │
│  • Average score per exercise                       │
│  • Most-missed exercises (drop-off points)          │
│  • AI Tutor intervention frequency                  │
│  • BKT mastery distribution across students         │
│  • Avg time per component vs. design target         │
│  • Homework submission & score analysis             │
│  • Parent note engagement rate                      │
└─────────────────────────────┬───────────────────────┘
                              │ Insights generated (30/60/90 days)
                              ▼
┌─────────────────────────────────────────────────────┐
│  14. PERIODIC REVIEW                                 │
│                                                      │
│  Trigger: 30 days post-publish OR flag from analytics│
│                                                      │
│  Review criteria:                                   │
│  • Completion rate < 70% → investigate UX           │
│  • Score on exercise X < 50% → revise exercise      │
│  • AI Tutor L4+ > 40% → theory too hard             │
│  • Parent note open rate < 30% → revise format      │
│  • BKT mastery after lesson < 0.7 → add practice    │
│                                                      │
│  Output: Version bump (patch/minor/major)            │
│  → Return to Step 3/4/5 as needed                  │
└─────────────────────────────┬───────────────────────┘
                              │
                    ┌─────────┴────────┐
                    │ Minor fix: patch │
                    │ Content update:  │
                    │ minor version    │
                    │ Major redesign:  │
                    │ major version    │
                    └──────────────────┘
```

### 17.2 AI-Assisted Production Flow

```
┌───────────────────────────────────────────────────────┐
│        AI-ASSISTED LESSON CREATION FLOW               │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Human Input:           AI Output:                   │
│  [Lesson spec]    ──►   [Draft theory]               │
│  [Grade, topic]   ──►   [5 exercises + answers]      │
│  [Objectives]     ──►   [AI prompts (all levels)]    │
│                         [Parent note draft]          │
│                                                       │
│  Human Review:          Final:                       │
│  [Verify accuracy] ──►  [Edit & approve]             │
│  [Adjust tone]    ──►   [QA checklist]               │
│  [Cultural fit]   ──►   [Publish]                    │
│                                                       │
│  Time Savings: 60–70% vs. fully manual production    │
│  Quality Gate: ALL content must pass human review    │
└───────────────────────────────────────────────────────┘
```

### 17.3 Student Learning Flow

```
┌─────────────────────────────────────────────────────────┐
│           STUDENT LEARNING JOURNEY (Per Lesson)          │
└─────────────────────────────────────────────────────────┘

Student Opens App
      │
      ▼
[Prior Knowledge Check — BKT P(L0)]
      │
      ├── P(mastery) ≥ 0.85 ──► SKIP INTRO → Challenge section
      │
      └── P(mastery) < 0.85 ──► Standard flow:
                │
                ▼
          Introduction (2 min)
                │
                ▼
          Warm-up (3–5 min)
           └─► Immediate feedback
                │
                ▼
          Motivation → Story (3–8 min)
                │
                ▼
          Theory + Visual (11–17 min)
           └─► AI Tutor available on demand
                │
                ▼
          Worked Examples (5–8 min)
                │
                ▼
          Guided Practice (8–10 min)
           ├─► Correct → Next exercise
           ├─► Wrong once → Hint Level 1
           ├─► Wrong twice → Hint Level 2
           └─► Wrong 3+ times → Hint Level 3+
                │
                ▼
          Independent Practice (8–12 min)
           ├─► BKT updates after each exercise
           ├─► P(mastery) ≥ 0.85 → completion signal
           └─► P(mastery) < 0.4 → remedial recommended
                │
                ▼
          [Optional] Challenge + Mini Game
                │
                ▼
          Reflection + Summary (4–6 min)
                │
                ▼
          Homework Assigned
                │
                ▼
          Parent Note Sent (auto)
                │
                ▼
          Analytics updated
                │
                ▼
          Next Lesson Recommended (A2PLM)
```

### 17.4 Content Review Escalation Flow

```
Error/Issue Detected
         │
         ▼
   [Severity?]
         │
    ┌────┴────┐
    ▼         ▼
[CRITICAL]  [MINOR]
    │           │
    ▼           ▼
Unpublish   Log for
immediately next patch
    │
    ▼
Hotfix team
nofified
    │
    ▼
Fix in < 24h
    │
    ▼
Re-QA → Re-publish
    │
    ▼
Incident report
```

---

## APPENDIX A: SUBJECT-SPECIFIC EXTENSIONS

### A.1 Mathematics (MATH) Specifics

**Bar Model Standard (Singapore Math):**
```
Problem: Lan có 24 viên bi. Lan cho Bảo 8 viên. Lan còn lại mấy viên?

Bar Model:
┌──────────────────────────────┐
│          24 viên bi           │
├────────────────────┬─────────┤
│    ? viên còn lại  │  8 viên │
└────────────────────┴─────────┘

Phép tính: 24 - 8 = 16 viên
```

**Number Bond Visual:**
```
    24
   /  \
  16    8
```

**MUST for Math lessons:**
- G1: All examples use manipulatives (beads, blocks, fingers)
- G2: Bar models for word problems
- G3: Multiple representations (bar, equation, diagram)

### A.2 English (ENG) Specifics

**Phonics Scope & Sequence (Aligned to Cambridge Phonics):**

| Phase | Content | Grade |
|---|---|---|
| Phase 1 | Environmental sounds, rhythm | G1 Term 1 |
| Phase 2 | Single letter sounds, CVC | G1 Term 1–2 |
| Phase 3 | Digraphs (ch, sh, th, ng) | G1 Term 2–3 |
| Phase 4 | Adjacent consonants (bl, cr, st) | G2 Term 1 |
| Phase 5 | Alternative spellings (ai/ay, ee/ea) | G2 Term 2–3 |
| Phase 6 | Spelling rules, morphology | G3 |

**Speaking Assessment Rubric:**
| Score | Pronunciation | Fluency | Confidence |
|---|---|---|---|
| 4 | Native-like clarity | Natural pace | Attempts without prompting |
| 3 | Minor errors, clear | Slight hesitation | Attempts with encouragement |
| 2 | Noticeable errors | Frequent pausing | Needs multiple prompts |
| 1 | Hard to understand | Very halting | Refuses or cannot attempt |

**MUST for ENG lessons:**
- Every lesson includes Audio (British or American — consistent per module)
- Minimum 1 Speaking exercise per ENG lesson
- Vocabulary presented: word + image + audio + sentence

### A.3 Computer Science (CS) Specifics

**Computational Thinking Framework (G1–G3):**

| CT Pillar | G1 | G2 | G3 |
|---|---|---|---|
| Decomposition | Break into 3–4 steps | Break into 5–7 steps | Identify sub-problems |
| Pattern Recognition | Identical patterns | Patterns with variation | Abstract patterns |
| Abstraction | Name the step | Simplify the detail | Represent with symbol |
| Algorithm | Write 3-step sequence | Branching (if/then) | Loops + conditionals |

**Unplugged Activities (No device required):**
- MUST: Each CS lesson has 1 unplugged activity option
- Purpose: Backup if tech fails; inclusive for low-device contexts
- Format: Role-play, card game, physical movement

---

## APPENDIX B: GLOSSARY

| Term | Definition |
|---|---|
| A2PLM | AvaB Adaptive Personalized Learning Model — AI engine driving lesson recommendations |
| BKT | Bayesian Knowledge Tracing — probabilistic model tracking student mastery |
| Bloom's Taxonomy | Framework classifying learning objectives into 6 cognitive levels |
| CPA | Concrete-Pictorial-Abstract — Singapore Math instructional approach |
| CLT | Cognitive Load Theory — managing mental effort during learning |
| HOTS | Higher Order Thinking Skills — Bloom's levels 4–6 |
| IB PYP | International Baccalaureate Primary Years Programme |
| LXD | Learning Experience Design — user experience design applied to education |
| MOET | Ministry of Education and Training (Vietnam) |
| P(mastery) | Probability of skill mastery in BKT model (0.0–1.0) |
| SOLO | Structure of Observed Learning Outcomes — 5 levels of understanding quality |
| UDL | Universal Design for Learning — accessibility-first instructional design |
| ZPD | Zone of Proximal Development (Vygotsky) — the learning sweet spot |

---

## APPENDIX C: REVISION HISTORY

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-07-04 | AvaB CLXA Team | Initial release — full 17-section standard |

---

## APPENDIX D: APPROVAL & OWNERSHIP

| Role | Name | Responsibility |
|---|---|---|
| Chief Learning Experience Architect | AvaB CLXA | Document owner, final authority |
| Curriculum Director | TBD | Content standards alignment |
| Head of Engineering | TBD | JSON schema, DB design sign-off |
| Head of Design | TBD | Illustration standard sign-off |
| Head of QA | TBD | QA checklist maintenance |
| AI Lead | TBD | AI Tutor standard sign-off |

**Review Schedule:** Annual — first review July 2027
**Amendment Process:** Minor changes (patch) via PR. Major changes (minor/major version) require full team review and CLXA sign-off.

---

> **AvaB Lesson Standard v1.0.0** — Designed for 10+ year stability.
> Every lesson is a promise to a child: *"I will make this moment count."*
>
> © 2026 AvaB Education. All rights reserved.
> Single Source of Truth — refer to latest version at `/teaching/AvaB-Lesson-Standard-v1.0.md`