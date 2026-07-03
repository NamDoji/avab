# AvaB Knowledge Graph Standard v1.0

> **Phiên bản:** 1.0  
> **Ngày ban hành:** 2026-07-04  
> **Tác giả:** AvaB AI Team  
> **Trạng thái:** DRAFT → Production

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Node Types](#2-node-types)
3. [Edge Types (Relationships)](#3-edge-types-relationships)
4. [Knowledge Graph Architecture](#4-knowledge-graph-architecture)
5. [JSON Schema](#5-json-schema)
6. [Database Design](#6-database-design)
7. [API / Query Standard](#7-api--query-standard)
8. [Sơ đồ minh họa: Bài toán Gà-Thỏ](#8-sơ-đồ-minh-họa-bài-toán-gà-thỏ)
9. [Integration với A2PLM](#9-integration-với-a2plm)
10. [QA Checklist](#10-qa-checklist)

---

## 1. Tổng quan

### 1.1 Mục tiêu

AvaB Knowledge Graph (AKG) là chuẩn biểu diễn tri thức cho toàn hệ thống AvaB. Chuẩn này cho phép:

- AI hiểu **mối quan hệ cấu trúc** giữa kiến thức và kỹ năng
- Xây dựng **lộ trình học tập thông minh** phù hợp từng học sinh
- Sinh **nội dung bài học chính xác** theo cấp độ và độ tuổi
- Tích hợp với **mô hình BKT / A2PLM** để theo dõi mastery
- Hỗ trợ **adaptive learning** theo thời gian thực

### 1.2 Nguyên tắc thiết kế

| Nguyên tắc | Mô tả |
|---|---|
| **Phân tầng rõ ràng** | Subject → Domain → Topic → Concept/Skill |
| **Độ tuổi làm metadata** | Không phân cây theo tuổi; tuổi là filter/attribute |
| **Bloom-aware** | Mỗi Lesson/Assessment gắn BloomLevel |
| **Prerequisite chặt chẽ** | Mọi Lesson phải khai báo tiên quyết |
| **Mở rộng được** | Thêm môn mới không làm vỡ graph hiện tại |
| **Machine-readable** | Toàn bộ schema JSON chuẩn, API-first |

### 1.3 Phạm vi v1.0

Các môn được chuẩn hóa ngay trong v1.0:
- **Toán Tư Duy** (primary)
- Tiếng Anh (basic taxonomy)
- Tin học (basic taxonomy)

---

## 2. Node Types

Mỗi node trong AKG thuộc một trong 13 loại sau. Mỗi loại có `type` cố định, schema attributes bắt buộc và tùy chọn.

---

### 2.1 Subject — Môn học

**Định nghĩa:** Đơn vị học thuật cao nhất trong hệ thống. Một Subject bao gồm nhiều Domain.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `math-thinking`, `english`, `coding` |
| `name` | ✅ | string | Tên đầy đủ |
| `name_vi` | ✅ | string | Tên tiếng Việt |
| `description` | ✅ | string | Mô tả ngắn |
| `age_range` | ✅ | [min, max] | Độ tuổi phù hợp |
| `icon` | ❌ | string (url) | Icon hiển thị |
| `color` | ❌ | string (hex) | Màu brand |
| `curriculum_code` | ❌ | string | Mã chương trình (VD: MOET-2018) |

**Ví dụ JSON:**
```json
{
  "id": "math-thinking",
  "type": "Subject",
  "name": "Mathematical Thinking",
  "name_vi": "Toán Tư Duy",
  "description": "Phát triển tư duy logic, phân tích và giải quyết vấn đề qua toán học",
  "age_range": [5, 12],
  "icon": "https://cdn.avab.io/icons/math-thinking.svg",
  "color": "#4A90E2",
  "curriculum_code": "AvaB-MTD-2024"
}
```

---

### 2.2 Domain — Lĩnh vực

**Định nghĩa:** Phân nhánh chuyên môn trong một Subject. Một Domain chứa nhiều Topic liên quan.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `arithmetic`, `geometry`, `algebra` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `subject_id` | ✅ | string | FK → Subject |
| `description` | ✅ | string | |
| `learning_outcomes` | ✅ | string[] | Kết quả học tập mong đợi |
| `order` | ❌ | number | Thứ tự gợi ý |

**Ví dụ JSON:**
```json
{
  "id": "arithmetic",
  "type": "Domain",
  "name": "Arithmetic",
  "name_vi": "Số học",
  "subject_id": "math-thinking",
  "description": "Các phép tính số học và mối quan hệ số",
  "learning_outcomes": [
    "Thực hiện được 4 phép tính cơ bản",
    "Hiểu quan hệ số chẵn/lẻ, ước/bội"
  ],
  "order": 1
}
```

---

### 2.3 Topic — Chủ đề

**Định nghĩa:** Đơn vị kiến thức có thể dạy trong 1–3 buổi học. Topic là nơi các Concept và Skill hội tụ.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `addition`, `number-patterns` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `domain_id` | ✅ | string | FK → Domain |
| `difficulty` | ✅ | 1–5 | Độ khó tổng quan |
| `estimated_hours` | ✅ | number | Giờ học ước tính |
| `age_min` | ✅ | number | Tuổi tối thiểu |
| `age_max` | ✅ | number | Tuổi tối đa |
| `keywords` | ❌ | string[] | Từ khóa tìm kiếm |
| `real_world_context` | ❌ | string | Ứng dụng thực tế |

**Ví dụ JSON:**
```json
{
  "id": "addition-with-carry",
  "type": "Topic",
  "name": "Addition with Carrying",
  "name_vi": "Phép cộng có nhớ",
  "domain_id": "arithmetic",
  "difficulty": 3,
  "estimated_hours": 2.5,
  "age_min": 7,
  "age_max": 9,
  "keywords": ["cộng", "có nhớ", "hàng đơn vị", "hàng chục"],
  "real_world_context": "Tính tiền khi mua đồ, đếm điểm trong trò chơi"
}
```

---

### 2.4 Concept — Khái niệm

**Định nghĩa:** Đơn vị kiến thức nguyên tử. Concept là "cái học sinh cần BIẾT" — định nghĩa, quy tắc, công thức.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `even-number`, `perimeter-rectangle` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `topic_id` | ✅ | string | FK → Topic |
| `definition` | ✅ | string | Định nghĩa chính xác, súc tích |
| `formal_notation` | ❌ | string | Ký hiệu toán học (LaTeX) |
| `examples` | ✅ | string[] | Ít nhất 2 ví dụ cụ thể |
| `counter_examples` | ❌ | string[] | Phản ví dụ |
| `bloom_level` | ✅ | enum | Cấp độ Bloom tương ứng |
| `visual_representation` | ❌ | string (url) | Hình ảnh minh họa |

**Ví dụ JSON:**
```json
{
  "id": "even-number",
  "type": "Concept",
  "name": "Even Number",
  "name_vi": "Số chẵn",
  "topic_id": "number-properties",
  "definition": "Số tự nhiên chia hết cho 2, tức là dư 0 khi chia cho 2",
  "formal_notation": "n \\in \\mathbb{Z}: n \\mod 2 = 0",
  "examples": ["2, 4, 6, 8, 10", "0 là số chẵn", "100 là số chẵn"],
  "counter_examples": ["1, 3, 5, 7, 9 là số lẻ, không phải chẵn"],
  "bloom_level": "Remember",
  "visual_representation": "https://cdn.avab.io/concepts/even-number.png"
}
```

---

### 2.5 Skill — Kỹ năng

**Định nghĩa:** "Cái học sinh cần LÀM ĐƯỢC" — năng lực thực hiện một thao tác hoặc quy trình.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `recognize-pattern`, `logical-reasoning` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `skill_type` | ✅ | enum | `procedural` / `conceptual` / `strategic` |
| `observable_behavior` | ✅ | string | Hành vi quan sát được (đo lường) |
| `mastery_criteria` | ✅ | object | Tiêu chí thành thạo |
| `topic_ids` | ✅ | string[] | Các Topic liên quan |
| `bloom_level` | ✅ | enum | Cấp Bloom |
| `cognitive_load` | ❌ | 1–5 | Tải nhận thức |

**Ví dụ JSON:**
```json
{
  "id": "recognize-number-pattern",
  "type": "Skill",
  "name": "Recognize Number Pattern",
  "name_vi": "Nhận biết quy luật dãy số",
  "skill_type": "strategic",
  "observable_behavior": "Học sinh xác định được quy luật và điền số tiếp theo trong dãy số",
  "mastery_criteria": {
    "accuracy_threshold": 0.85,
    "min_attempts": 5,
    "consecutive_correct": 3
  },
  "topic_ids": ["number-patterns", "sequences"],
  "bloom_level": "Analyze",
  "cognitive_load": 3
}
```

---

### 2.6 Competency — Năng lực

**Định nghĩa:** Năng lực bậc cao, tổng hợp nhiều Skill. Competency là mục tiêu giáo dục dài hạn.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `critical-thinking`, `problem-solving` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `competency_framework` | ✅ | string | Khung năng lực (21CC, MOET, AvaB) |
| `description` | ✅ | string | |
| `indicators` | ✅ | string[] | Chỉ số biểu hiện |
| `assessment_rubric` | ❌ | object | Rubric đánh giá |
| `subject_ids` | ✅ | string[] | Liên quan đến môn học nào |

**Ví dụ JSON:**
```json
{
  "id": "mathematical-reasoning",
  "type": "Competency",
  "name": "Mathematical Reasoning",
  "name_vi": "Lập luận toán học",
  "competency_framework": "AvaB-21CC",
  "description": "Khả năng suy luận logic, lập luận có căn cứ và trình bày lý do toán học",
  "indicators": [
    "Giải thích được tại sao câu trả lời đúng",
    "Nhận ra mẫu và tổng quát hóa",
    "Phát hiện mâu thuẫn trong lập luận"
  ],
  "subject_ids": ["math-thinking"]
}
```

---

### 2.7 Lesson — Bài học

**Định nghĩa:** Đơn vị giảng dạy có thể thực thi. Một Lesson = một buổi học hoặc một module tự học.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string (slug) | `lesson-addition-carry-g2-01` |
| `name` | ✅ | string | |
| `name_vi` | ✅ | string | |
| `topic_id` | ✅ | string | FK → Topic |
| `grade` | ✅ | number | Khối lớp (1–12) |
| `age_group_id` | ✅ | string | FK → AgeGroup |
| `duration_minutes` | ✅ | number | Thời lượng |
| `bloom_levels` | ✅ | enum[] | Cấp Bloom được kích hoạt |
| `objectives` | ✅ | string[] | Mục tiêu bài học (action verbs) |
| `activity_types` | ✅ | enum[] | `video/quiz/game/worksheet/story` |
| `difficulty` | ✅ | 1–5 | |
| `concept_ids` | ✅ | string[] | Concept được dạy |
| `skill_ids` | ✅ | string[] | Skill được luyện |
| `version` | ✅ | string | `1.0.0` |
| `last_updated` | ✅ | date | |
| `author` | ❌ | string | |
| `tags` | ❌ | string[] | |

**Ví dụ JSON:**
```json
{
  "id": "lesson-addition-carry-g2-01",
  "type": "Lesson",
  "name": "Addition with Carrying — Grade 2 Lesson 1",
  "name_vi": "Phép cộng có nhớ — Lớp 2 Bài 1",
  "topic_id": "addition-with-carry",
  "grade": 2,
  "age_group_id": "age-7-8",
  "duration_minutes": 45,
  "bloom_levels": ["Remember", "Understand", "Apply"],
  "objectives": [
    "Học sinh NHẬN BIẾT khi nào phép cộng có nhớ",
    "Học sinh THỰC HIỆN cộng 2 chữ số có nhớ",
    "Học sinh ÁP DỤNG vào bài toán thực tế"
  ],
  "activity_types": ["video", "quiz", "game"],
  "difficulty": 3,
  "concept_ids": ["carrying-concept", "place-value"],
  "skill_ids": ["add-two-digit-carry", "check-result"],
  "version": "1.0.0",
  "last_updated": "2026-07-04"
}
```

---

### 2.8 Prerequisite — Điều kiện tiên quyết

**Định nghĩa:** Không phải node độc lập — Prerequisite là loại **edge đặc biệt** được reify thành node khi cần gắn metadata phức tạp (strength, alternative paths).

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | |
| `from_node_id` | ✅ | string | Node cần học trước |
| `to_node_id` | ✅ | string | Node cần học sau |
| `strength` | ✅ | enum | `hard` / `soft` / `recommended` |
| `rationale` | ✅ | string | Lý do tại sao cần tiên quyết |
| `bypass_condition` | ❌ | string | Điều kiện để bỏ qua |

```json
{
  "id": "prereq-001",
  "type": "Prerequisite",
  "from_node_id": "topic-addition-basic",
  "to_node_id": "topic-addition-with-carry",
  "strength": "hard",
  "rationale": "Học sinh phải thành thạo cộng không nhớ trước khi học có nhớ",
  "bypass_condition": "Nếu diagnostic score >= 90% thì bỏ qua"
}
```

---

### 2.9 AgeGroup — Nhóm tuổi

**Định nghĩa:** Phân nhóm độ tuổi/lớp để filter nội dung phù hợp.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | `age-5-6`, `age-7-8`, `age-9-10`, `age-11-12` |
| `name` | ✅ | string | "7–8 tuổi (Lớp 2)" |
| `age_min` | ✅ | number | |
| `age_max` | ✅ | number | |
| `grade_range` | ✅ | [min, max] | Khối lớp tương ứng |
| `cognitive_stage` | ✅ | string | Giai đoạn Piaget |
| `attention_span_min` | ✅ | number | Thời gian tập trung (phút) |
| `preferred_formats` | ✅ | string[] | Định dạng học phù hợp |

```json
{
  "id": "age-7-8",
  "type": "AgeGroup",
  "name": "7–8 tuổi (Lớp 2)",
  "age_min": 7,
  "age_max": 8,
  "grade_range": [2, 2],
  "cognitive_stage": "Concrete Operational (Piaget)",
  "attention_span_min": 20,
  "preferred_formats": ["visual", "game", "story", "hands-on"]
}
```

---

### 2.10 BloomLevel — Cấp độ Bloom

**Định nghĩa:** Cấp độ nhận thức theo Bloom's Taxonomy (Revised).

| ID | Cấp độ | Mô tả | Action Verbs |
|---|---|---|---|
| `bloom-1-remember` | Remember | Ghi nhớ, tái hiện | nhận biết, liệt kê, đọc, định nghĩa |
| `bloom-2-understand` | Understand | Giải thích, mô tả | giải thích, tóm tắt, phân biệt |
| `bloom-3-apply` | Apply | Dùng kiến thức vào tình huống | tính, thực hiện, áp dụng |
| `bloom-4-analyze` | Analyze | Phân tích cấu trúc | so sánh, phân tích, tìm quy luật |
| `bloom-5-evaluate` | Evaluate | Đánh giá, phán xét | đánh giá, kiểm tra, phê bình |
| `bloom-6-create` | Create | Sáng tạo, tổng hợp | tạo ra, thiết kế, xây dựng |

```json
{
  "id": "bloom-3-apply",
  "type": "BloomLevel",
  "name": "Apply",
  "name_vi": "Vận dụng",
  "order": 3,
  "description": "Dùng kiến thức đã học để giải quyết tình huống mới",
  "action_verbs_vi": ["tính", "thực hiện", "giải", "áp dụng", "vẽ"],
  "question_stems": [
    "Hãy tính...",
    "Giải bài toán sau...",
    "Áp dụng công thức để..."
  ]
}
```

---

### 2.11 Resource — Tài nguyên học tập

**Định nghĩa:** Bất kỳ nội dung học tập có thể truy cập được.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | |
| `name` | ✅ | string | |
| `resource_type` | ✅ | enum | `video/worksheet/game/story/animation/flashcard` |
| `url` | ✅ | string | |
| `duration_seconds` | ❌ | number | Với video |
| `language` | ✅ | string | `vi`, `en` |
| `age_group_ids` | ✅ | string[] | Phù hợp với AgeGroup nào |
| `bloom_levels` | ✅ | enum[] | |
| `accessibility` | ❌ | object | `{subtitle: true, audio_description: true}` |

---

### 2.12 Assessment — Đánh giá

**Định nghĩa:** Bài kiểm tra, câu hỏi, rubric đánh giá kiến thức/kỹ năng.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | |
| `name` | ✅ | string | |
| `assessment_type` | ✅ | enum | `diagnostic/formative/summative` |
| `question_type` | ✅ | enum | `mcq/fill-blank/drag-drop/open-ended` |
| `bloom_level` | ✅ | enum | |
| `concept_ids` | ✅ | string[] | Concept được kiểm tra |
| `skill_ids` | ✅ | string[] | Skill được kiểm tra |
| `difficulty` | ✅ | 1–5 | |
| `time_limit_seconds` | ❌ | number | |
| `scoring_rubric` | ❌ | object | Hướng dẫn chấm |
| `hint_allowed` | ✅ | boolean | |

```json
{
  "id": "assess-addition-carry-g2-01",
  "type": "Assessment",
  "name": "Kiểm tra phép cộng có nhớ — Lớp 2",
  "assessment_type": "formative",
  "question_type": "fill-blank",
  "bloom_level": "Apply",
  "concept_ids": ["carrying-concept", "place-value"],
  "skill_ids": ["add-two-digit-carry"],
  "difficulty": 3,
  "time_limit_seconds": 60,
  "hint_allowed": true
}
```

---

### 2.13 Misconception — Hiểu sai thường gặp

**Định nghĩa:** Quan niệm sai hoặc lỗi tư duy phổ biến cần AI nhận diện và sửa chữa.

| Attribute | Bắt buộc | Kiểu | Mô tả |
|---|---|---|---|
| `id` | ✅ | string | |
| `name` | ✅ | string | Tên ngắn gọn |
| `description` | ✅ | string | Mô tả chi tiết hiểu sai |
| `example_error` | ✅ | string | Ví dụ lỗi học sinh thường mắc |
| `root_cause` | ✅ | string | Nguyên nhân gốc rễ |
| `correction_strategy` | ✅ | string | Chiến lược sửa |
| `concept_ids` | ✅ | string[] | Concept liên quan |
| `frequency` | ✅ | enum | `very_common/common/occasional/rare` |
| `detection_pattern` | ✅ | string | Pattern để AI phát hiện |

```json
{
  "id": "misc-carry-forget",
  "type": "Misconception",
  "name": "Quên nhớ khi cộng",
  "description": "Học sinh thực hiện đúng từng cột nhưng quên thêm số nhớ vào cột tiếp theo",
  "example_error": "28 + 45 = 63 (đúng phải là 73, học sinh quên nhớ 1)",
  "root_cause": "Chưa hiểu bản chất của hàng chục; xử lý từng chữ số độc lập",
  "correction_strategy": "Dùng bảng vị trí (place value chart); tô màu số nhớ; đọc to từng bước",
  "concept_ids": ["carrying-concept", "place-value"],
  "frequency": "very_common",
  "detection_pattern": "result == correct_ones_digit + correct_tens_digit * 10 (missing carry)"
}
```

---

## 3. Edge Types (Relationships)

Mỗi edge kết nối hai node với một loại quan hệ xác định. Chuẩn AKG định nghĩa 11 loại edge.

### Bảng tổng quan

| Edge | Chiều | Cardinality | Mô tả ngắn |
|---|---|---|---|
| `is_a` | → | N:1 | Phân loại / Là một loại |
| `part_of` | → | N:1 | Thành phần của |
| `prerequisite_of` | → | N:N | Điều kiện trước của |
| `requires` | → | N:N | Yêu cầu kỹ năng/khái niệm |
| `leads_to` | → | N:N | Dẫn đến (học xong sẽ có thể) |
| `supports` | → | N:N | Hỗ trợ (không bắt buộc) |
| `belongs_to` | → | N:1 | Thuộc về Subject/Domain |
| `suitable_for` | → | N:N | Phù hợp với AgeGroup |
| `assesses` | → | N:N | Đánh giá Concept/Skill |
| `corrects` | → | N:N | Sửa Misconception |
| `reinforces` | → | N:N | Củng cố Concept/Skill |

---

### 3.1 `is_a` — Phân loại

**Định nghĩa:** Node nguồn là một loại/trường hợp cụ thể của node đích.

- **Chiều:** Source → Target
- **Cardinality:** N:1 (nhiều Concept cụ thể → 1 Topic cha)
- **Valid pairs:** `Concept → Topic`, `Topic → Domain`, `Domain → Subject`, `Skill → Competency`

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `confidence` | 0.0–1.0 | Độ chắc chắn của phân loại |
| `source` | string | Người/hệ thống tạo edge |

**Ví dụ:**
```json
{
  "id": "edge-001",
  "type": "is_a",
  "from": "concept-addition-with-carry",
  "to": "topic-addition",
  "confidence": 1.0,
  "source": "curriculum-team"
}
```

> **Ví dụ ngôn ngữ tự nhiên:** "Cộng có nhớ **is_a** Phép cộng"

---

### 3.2 `part_of` — Thành phần

**Định nghĩa:** Node nguồn là một phần cấu thành của node đích (quan hệ composition).

- **Chiều:** Source → Target
- **Cardinality:** N:1
- **Valid pairs:** `Topic → Domain`, `Domain → Subject`, `Concept → Topic`, `Lesson → Topic`

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `weight` | 0.0–1.0 | Tỷ trọng (Topic chiếm bao nhiêu % Domain) |
| `order` | number | Thứ tự trong cấu trúc cha |

**Ví dụ:**
```json
{
  "id": "edge-002",
  "type": "part_of",
  "from": "topic-addition",
  "to": "domain-arithmetic",
  "weight": 0.3,
  "order": 1
}
```

> **Ví dụ:** "Phép cộng **part_of** Số học" | "Số học **part_of** Toán Tư Duy"

---

### 3.3 `prerequisite_of` — Điều kiện trước

**Định nghĩa:** Node nguồn phải được học thành thạo TRƯỚC khi học node đích.

- **Chiều:** Source → Target (Học Source trước, rồi mới đến Target)
- **Cardinality:** N:N
- **Valid pairs:** `Topic → Topic`, `Lesson → Lesson`, `Concept → Concept`, `Skill → Skill`

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `strength` | `hard/soft/recommended` | Bắt buộc / Khuyến nghị |
| `mastery_threshold` | 0.0–1.0 | Ngưỡng thành thạo cần đạt |
| `rationale` | string | Lý do |
| `bypass_condition` | string | Điều kiện bỏ qua |

**Ví dụ:**
```json
{
  "id": "edge-003",
  "type": "prerequisite_of",
  "from": "topic-addition-basic",
  "to": "topic-addition-with-carry",
  "strength": "hard",
  "mastery_threshold": 0.8,
  "rationale": "Không thể cộng có nhớ nếu chưa thành thạo cộng cơ bản",
  "bypass_condition": "diagnostic_score >= 0.9"
}
```

> **Ví dụ:** "Số đến 100 **prerequisite_of** Cộng 3 chữ số"

---

### 3.4 `requires` — Yêu cầu

**Định nghĩa:** Để học/thực hiện node nguồn, cần có Skill hoặc Concept cụ thể.

- **Chiều:** Source → Target
- **Cardinality:** N:N
- **Valid pairs:** `Lesson → Skill`, `Lesson → Concept`, `Topic → Skill`

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `requirement_type` | `essential/helpful` | Cần thiết hay chỉ hữu ích |
| `minimum_level` | string | Mức tối thiểu (nếu có thang đo) |

```json
{
  "id": "edge-004",
  "type": "requires",
  "from": "lesson-chicken-rabbit-problem",
  "to": "skill-system-of-equations",
  "requirement_type": "essential"
}
```

> **Ví dụ:** "Bài toán Gà-Thỏ **requires** kỹ năng lập phương trình"

---

### 3.5 `leads_to` — Dẫn đến

**Định nghĩa:** Học xong node nguồn sẽ MỞ KHÓA hoặc chuẩn bị tốt cho node đích.

- **Chiều:** Source → Target
- **Cardinality:** N:N
- **Valid pairs:** `Topic → Topic`, `Skill → Skill`, `Skill → Competency`

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `probability` | 0.0–1.0 | Xác suất dẫn đến thành công |
| `time_gap_days` | number | Khoảng cách học gợi ý |

```json
{
  "id": "edge-005",
  "type": "leads_to",
  "from": "skill-recognize-pattern",
  "to": "competency-mathematical-reasoning",
  "probability": 0.75,
  "time_gap_days": 30
}
```

---

### 3.6 `supports` — Hỗ trợ

**Định nghĩa:** Node nguồn cung cấp nền tảng hỗ trợ (không bắt buộc) cho node đích.

- **Chiều:** Source → Target
- **Cardinality:** N:N
- **Phân biệt với `prerequisite_of`:** Không có yêu cầu mastery threshold; bỏ qua được dễ dàng

```json
{
  "id": "edge-006",
  "type": "supports",
  "from": "topic-number-patterns",
  "to": "topic-algebra-intro",
  "note": "Nhận biết quy luật số giúp học đại số dễ hơn nhưng không bắt buộc"
}
```

---

### 3.7 `belongs_to` — Thuộc về

**Định nghĩa:** Node thuộc về một đơn vị tổ chức lớn hơn.

- **Valid pairs:** `Resource → Subject`, `Assessment → Domain`, `Lesson → Topic`
- Dùng khi `part_of` quá mạnh (node có thể thuộc về nhiều cha)

```json
{
  "id": "edge-007",
  "type": "belongs_to",
  "from": "resource-video-addition-carry",
  "to": "topic-addition-with-carry"
}
```

---

### 3.8 `suitable_for` — Phù hợp với độ tuổi

**Định nghĩa:** Lesson/Resource/Assessment phù hợp với AgeGroup cụ thể.

- **Chiều:** Source → AgeGroup
- **Cardinality:** N:N

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `suitability_score` | 0.0–1.0 | Mức độ phù hợp |
| `adaptation_notes` | string | Ghi chú điều chỉnh nếu cần |

```json
{
  "id": "edge-008",
  "type": "suitable_for",
  "from": "lesson-addition-carry-g2-01",
  "to": "age-7-8",
  "suitability_score": 0.95,
  "adaptation_notes": null
}
```

---

### 3.9 `assesses` — Đánh giá

**Định nghĩa:** Assessment đo lường Concept hoặc Skill cụ thể.

- **Chiều:** Assessment → Concept/Skill
- **Cardinality:** N:N

**Attributes:**
| Attribute | Kiểu | Mô tả |
|---|---|---|
| `bloom_alignment` | enum | Cấp Bloom được đánh giá |
| `weight` | 0.0–1.0 | Trọng số trong tổng điểm |

```json
{
  "id": "edge-009",
  "type": "assesses",
  "from": "assess-addition-carry-g2-01",
  "to": "skill-add-two-digit-carry",
  "bloom_alignment": "Apply",
  "weight": 0.6
}
```

---

### 3.10 `corrects` — Sửa hiểu sai

**Định nghĩa:** Resource/Lesson/Activity được thiết kế để khắc phục Misconception cụ thể.

- **Chiều:** Resource/Lesson → Misconception
- **Cardinality:** N:N

```json
{
  "id": "edge-010",
  "type": "corrects",
  "from": "activity-place-value-chart",
  "to": "misc-carry-forget",
  "effectiveness_rating": 4.2
}
```

---

### 3.11 `reinforces` — Củng cố

**Định nghĩa:** Resource/Lesson/Game củng cố (luyện tập thêm) một Concept/Skill đã học.

- **Chiều:** Resource/Activity → Concept/Skill
- **Cardinality:** N:N
- **Phân biệt với `assesses`:** Không đo lường, chỉ luyện tập

```json
{
  "id": "edge-011",
  "type": "reinforces",
  "from": "game-number-race",
  "to": "concept-even-number",
  "reinforcement_type": "spaced_repetition"
}
```

---

## 4. Knowledge Graph Architecture

### 4.1 Cấu trúc phân tầng (Hierarchy)

```
LEVEL 0 - SUBJECT
═══════════════════════════════════════════════
         [Toán Tư Duy]        [Tiếng Anh]
              │
LEVEL 1 - DOMAIN
═══════════════════════════════════════════════
    [Số học]  [Hình học]  [Đại số]  [Logic]
        │
LEVEL 2 - TOPIC
═══════════════════════════════════════════════
  [Phép cộng]  [Phép trừ]  [Tính nhẩm]
      │
LEVEL 3 - CONCEPT / SKILL
═══════════════════════════════════════════════
  [Số nhớ] [Hàng đơn vị]     [Kỹ năng cộng có nhớ]
                     ↓
LEVEL 4 - LESSON / ASSESSMENT / RESOURCE
═══════════════════════════════════════════════
  [Bài 1: Video]  [Quiz]  [Game]  [Worksheet]

CROSS-CUTTING (không phân tầng)
═══════════════════════════════════════════════
  [BloomLevel]  [AgeGroup]  [Competency]  [Misconception]
  ← kết nối vào mọi tầng thông qua edges →
```

### 4.2 Core Traversal Patterns

#### Pattern A: Lộ trình học (Learning Path)
```
Goal: Học sinh muốn học "Cộng 3 chữ số"

TRAVERSE:
  topic-addition-3-digit
    ← prerequisite_of ← topic-addition-with-carry
        ← prerequisite_of ← topic-addition-basic
            ← prerequisite_of ← concept-number-to-100

RESULT: [number-to-100] → [addition-basic] → [addition-carry] → [addition-3-digit]
```

#### Pattern B: Adaptive Content Selection
```
Input: student_age=8, current_mastery=0.6, target=topic-addition-carry

TRAVERSE:
  topic-addition-carry
    → suitable_for → [age-7-8, age-8-9]        (filter by age)
    → part_of → lessons[]                        (find lessons)
    → lessons filtered by difficulty <= 3        (match mastery)
    → assesses → skills[]                        (check coverage)

RESULT: Ordered lesson set for this student
```

#### Pattern C: Misconception Detection
```
Input: student_answer = wrong_result

TRAVERSE:
  wrong_answer_type
    → matches → misconception-node
        → corrects ← activity/resource
            → suitable_for → student.age_group

RESULT: Targeted remediation activity
```

#### Pattern D: Competency Coverage Check
```
Input: competency-mathematical-reasoning

TRAVERSE:
  competency
    ← leads_to ← skills[]
        ← requires ← lessons[]
            ← part_of ← topics[]

RESULT: All topics/lessons needed to build this competency
```

### 4.3 Quy tắc xây dựng Graph

| # | Quy tắc | Mô tả |
|---|---|---|
| R1 | **ID duy nhất toàn cục** | Không có 2 node cùng ID dù khác type |
| R2 | **Không vòng lặp prerequisite** | Graph tiên quyết phải là DAG (Directed Acyclic Graph) |
| R3 | **Lesson phải có Concept** | Mỗi Lesson phải link ít nhất 1 Concept và 1 Skill |
| R4 | **Assessment phải assesses** | Mỗi Assessment phải đánh giá ít nhất 1 Concept/Skill |
| R5 | **AgeGroup phải khai báo** | Mọi Lesson phải có edge `suitable_for` |
| R6 | **BloomLevel phải nhất quán** | Bloom của Lesson ≥ Bloom của Prerequisites |
| R7 | **Misconception phải linked** | Mỗi Misconception phải có ≥1 edge `corrects` |
| R8 | **Prerequisite strength** | Hard prerequisite: mastery_threshold ≥ 0.8 |
| R9 | **Version tracking** | Mọi Lesson, Concept, Skill phải có `version` |
| R10 | **Tối đa 7 cấp độ** | Không được nest sâu hơn 7 levels trong bất kỳ path nào |

### 4.4 Quy tắc mở rộng (Thêm môn mới)

```
1. TẠO Subject node mới (unique ID, không conflict)
2. TẠO Domain nodes → link part_of → Subject
3. MAP Competency hiện tại hoặc TẠO mới
4. TẠO Topics → link part_of → Domain
5. TẠO Concepts/Skills → link is_a → Topics
6. KIỂM TRA: Không có prerequisite cycle
7. KIỂM TRA: Tất cả Lesson có suitable_for
8. CHẠY: graph_validate endpoint
9. MERGE: Nếu Skill đã tồn tại (ví dụ: logical-reasoning),
         dùng ID cũ → cross-subject skill sharing
```

### 4.5 Conflict Resolution Rules

| Conflict | Resolution |
|---|---|
| Duplicate ID | Reject: Require unique ID; append `-v2` nếu là update |
| Prerequisite cycle | Reject: Phá cycle bằng cách xóa edge yếu nhất |
| Bloom inconsistency | Warn: Flag để curriculum team review |
| Age range overlap | Allow: Multiple suitable_for edges được phép |
| Duplicate Misconception | Merge: Giữ misconception có frequency cao hơn |
| Skill tương tự | Review: Curriculum team quyết định merge/split |

---

## 5. JSON Schema

### 5.1 Generic Node Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AKG Node",
  "type": "object",
  "required": ["id", "type", "name", "name_vi", "created_at", "version"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9][a-z0-9-]{1,63}$",
      "description": "Slug ID duy nhất toàn cục"
    },
    "type": {
      "type": "string",
      "enum": ["Subject","Domain","Topic","Concept","Skill","Competency",
               "Lesson","Prerequisite","AgeGroup","BloomLevel",
               "Resource","Assessment","Misconception"]
    },
    "name": { "type": "string", "minLength": 2, "maxLength": 200 },
    "name_vi": { "type": "string", "minLength": 2, "maxLength": 200 },
    "description": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "is_active": { "type": "boolean", "default": true },
    "metadata": { "type": "object" }
  }
}
```

### 5.2 Edge/Relationship Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AKG Edge",
  "type": "object",
  "required": ["id", "type", "from", "to", "created_at"],
  "properties": {
    "id": { "type": "string", "pattern": "^edge-[a-z0-9-]+$" },
    "type": {
      "type": "string",
      "enum": ["is_a","part_of","prerequisite_of","requires","leads_to",
               "supports","belongs_to","suitable_for","assesses",
               "corrects","reinforces"]
    },
    "from": { "type": "string", "description": "Source node ID" },
    "to": { "type": "string", "description": "Target node ID" },
    "weight": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "source": { "type": "string", "description": "Ai tạo edge này" },
    "created_at": { "type": "string", "format": "date-time" },
    "properties": {
      "type": "object",
      "description": "Edge-type-specific properties"
    }
  }
}
```

### 5.3 Graph Query Response Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AKG Query Response",
  "type": "object",
  "required": ["query_id", "timestamp", "data"],
  "properties": {
    "query_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "query_params": { "type": "object" },
    "data": {
      "type": "object",
      "properties": {
        "nodes": {
          "type": "array",
          "items": { "$ref": "#/definitions/node" }
        },
        "edges": {
          "type": "array",
          "items": { "$ref": "#/definitions/edge" }
        },
        "path": { "$ref": "#/definitions/knowledge_path" },
        "meta": {
          "type": "object",
          "properties": {
            "total_nodes": { "type": "integer" },
            "total_edges": { "type": "integer" },
            "query_time_ms": { "type": "number" },
            "graph_version": { "type": "string" }
          }
        }
      }
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "message": { "type": "string" },
          "node_id": { "type": "string" }
        }
      }
    }
  }
}
```

### 5.4 Knowledge Path Schema

```json
{
  "title": "Knowledge Path",
  "type": "object",
  "required": ["path_id", "from_node", "to_node", "steps", "total_estimated_hours"],
  "properties": {
    "path_id": { "type": "string" },
    "from_node": { "type": "string" },
    "to_node": { "type": "string" },
    "student_context": {
      "type": "object",
      "properties": {
        "age": { "type": "integer" },
        "grade": { "type": "integer" },
        "current_mastery": { "type": "object" }
      }
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_order": { "type": "integer" },
          "node_id": { "type": "string" },
          "node_type": { "type": "string" },
          "node_name_vi": { "type": "string" },
          "estimated_hours": { "type": "number" },
          "prerequisite_met": { "type": "boolean" },
          "recommended_resources": { "type": "array" },
          "bloom_level": { "type": "string" }
        }
      }
    },
    "total_estimated_hours": { "type": "number" },
    "difficulty_curve": {
      "type": "string",
      "enum": ["flat", "gradual", "steep", "adaptive"]
    },
    "path_quality_score": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
```

### 5.5 Ví dụ đầy đủ: Toán Tư Duy Lớp 2

```json
{
  "graph_id": "avab-graph-math-thinking-g2",
  "version": "1.0.0",
  "generated_at": "2026-07-04T00:00:00Z",
  "nodes": [
    {
      "id": "math-thinking",
      "type": "Subject",
      "name": "Mathematical Thinking",
      "name_vi": "Toán Tư Duy",
      "age_range": [5, 12],
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "arithmetic",
      "type": "Domain",
      "name": "Arithmetic",
      "name_vi": "Số học",
      "subject_id": "math-thinking",
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "addition-with-carry",
      "type": "Topic",
      "name": "Addition with Carrying",
      "name_vi": "Phép cộng có nhớ",
      "domain_id": "arithmetic",
      "difficulty": 3,
      "estimated_hours": 2.5,
      "age_min": 7,
      "age_max": 9,
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "carrying-concept",
      "type": "Concept",
      "name": "The Carrying (Regrouping) Concept",
      "name_vi": "Khái niệm số nhớ (gộp nhóm)",
      "topic_id": "addition-with-carry",
      "definition": "Khi tổng một cột vượt 9, phần dư 10 được 'nhớ' sang cột bên trái",
      "examples": ["8+7=15: viết 5, nhớ 1", "9+9=18: viết 8, nhớ 1"],
      "bloom_level": "Understand",
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "skill-add-two-digit-carry",
      "type": "Skill",
      "name": "Add Two-Digit Numbers with Carrying",
      "name_vi": "Cộng 2 chữ số có nhớ",
      "skill_type": "procedural",
      "observable_behavior": "Học sinh tính đúng tổng 2 số 2 chữ số có nhớ",
      "mastery_criteria": {
        "accuracy_threshold": 0.85,
        "min_attempts": 5,
        "consecutive_correct": 3
      },
      "topic_ids": ["addition-with-carry"],
      "bloom_level": "Apply",
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "lesson-addition-carry-g2-01",
      "type": "Lesson",
      "name": "Addition with Carrying — Grade 2, Lesson 1",
      "name_vi": "Phép cộng có nhớ — Lớp 2 Bài 1",
      "topic_id": "addition-with-carry",
      "grade": 2,
      "age_group_id": "age-7-8",
      "duration_minutes": 45,
      "bloom_levels": ["Remember", "Understand", "Apply"],
      "objectives": [
        "Học sinh NHẬN BIẾT khi nào phép cộng có nhớ",
        "Học sinh GIẢI THÍCH được ý nghĩa số nhớ",
        "Học sinh TÍNH đúng phép cộng 2 chữ số có nhớ"
      ],
      "activity_types": ["video", "quiz", "game"],
      "difficulty": 3,
      "concept_ids": ["carrying-concept", "place-value"],
      "skill_ids": ["skill-add-two-digit-carry"],
      "version": "1.0.0",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "edges": [
    {
      "id": "edge-arithmetic-part-of-math",
      "type": "part_of",
      "from": "arithmetic",
      "to": "math-thinking",
      "weight": 0.4,
      "order": 1
    },
    {
      "id": "edge-addcarry-part-of-arithmetic",
      "type": "part_of",
      "from": "addition-with-carry",
      "to": "arithmetic",
      "weight": 0.25,
      "order": 2
    },
    {
      "id": "edge-carrying-isa-addcarry",
      "type": "is_a",
      "from": "carrying-concept",
      "to": "addition-with-carry",
      "confidence": 1.0
    },
    {
      "id": "edge-prereq-basic-to-carry",
      "type": "prerequisite_of",
      "from": "topic-addition-basic",
      "to": "addition-with-carry",
      "properties": {
        "strength": "hard",
        "mastery_threshold": 0.8,
        "rationale": "Học sinh cần thành thạo cộng cơ bản"
      }
    },
    {
      "id": "edge-lesson-suitable-age7-8",
      "type": "suitable_for",
      "from": "lesson-addition-carry-g2-01",
      "to": "age-7-8",
      "properties": { "suitability_score": 0.95 }
    },
    {
      "id": "edge-lesson-requires-concept",
      "type": "requires",
      "from": "lesson-addition-carry-g2-01",
      "to": "carrying-concept",
      "properties": { "requirement_type": "essential" }
    }
  ]
}
```

---

## 6. Database Design

### 6.1 PostgreSQL Schema (Recommended cho Production)

```sql
-- ============================================
-- AvaB Knowledge Graph Database Schema v1.0
-- ============================================

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================
-- NODES TABLE
-- ============================================
CREATE TABLE akg_nodes (
    id              VARCHAR(64) PRIMARY KEY,
    type            VARCHAR(32) NOT NULL,
    name            TEXT NOT NULL,
    name_vi         TEXT NOT NULL,
    description     TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    attributes      JSONB NOT NULL DEFAULT '{}',
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(64),
    
    CONSTRAINT valid_type CHECK (type IN (
        'Subject','Domain','Topic','Concept','Skill','Competency',
        'Lesson','Prerequisite','AgeGroup','BloomLevel',
        'Resource','Assessment','Misconception'
    )),
    CONSTRAINT valid_id CHECK (id ~ '^[a-z0-9][a-z0-9-]{1,63}$')
);

-- ============================================
-- EDGES TABLE
-- ============================================
CREATE TABLE akg_edges (
    id              VARCHAR(64) PRIMARY KEY DEFAULT ('edge-' || uuid_generate_v4()::text),
    type            VARCHAR(32) NOT NULL,
    from_node       VARCHAR(64) NOT NULL REFERENCES akg_nodes(id),
    to_node         VARCHAR(64) NOT NULL REFERENCES akg_nodes(id),
    weight          NUMERIC(4,3) CHECK (weight BETWEEN 0 AND 1),
    confidence      NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    properties      JSONB NOT NULL DEFAULT '{}',
    source          VARCHAR(64),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_edge_type CHECK (type IN (
        'is_a','part_of','prerequisite_of','requires','leads_to',
        'supports','belongs_to','suitable_for','assesses',
        'corrects','reinforces'
    )),
    CONSTRAINT no_self_loop CHECK (from_node != to_node)
);

-- ============================================
-- GRAPH SNAPSHOTS (for versioning)
-- ============================================
CREATE TABLE akg_snapshots (
    snapshot_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    graph_version   VARCHAR(20) NOT NULL,
    snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    node_count      INTEGER,
    edge_count      INTEGER,
    snapshot_data   JSONB,  -- Full graph export
    notes           TEXT
);

-- ============================================
-- CHANGE LOG (Audit Trail)
-- ============================================
CREATE TABLE akg_changelog (
    log_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(10) NOT NULL CHECK (entity_type IN ('node','edge')),
    entity_id       VARCHAR(64) NOT NULL,
    change_type     VARCHAR(10) NOT NULL CHECK (change_type IN ('create','update','delete')),
    old_value       JSONB,
    new_value       JSONB,
    changed_by      VARCHAR(64),
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason          TEXT
);
```

### 6.2 Index Strategy

```sql
-- Node lookup
CREATE INDEX idx_nodes_type ON akg_nodes(type);
CREATE INDEX idx_nodes_active ON akg_nodes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_nodes_tags ON akg_nodes USING GIN(tags);
CREATE INDEX idx_nodes_attributes ON akg_nodes USING GIN(attributes);
CREATE INDEX idx_nodes_name_search ON akg_nodes USING GIN(name_vi gin_trgm_ops);

-- Edge traversal (most critical)
CREATE INDEX idx_edges_from ON akg_edges(from_node) WHERE is_active = TRUE;
CREATE INDEX idx_edges_to ON akg_edges(to_node) WHERE is_active = TRUE;
CREATE INDEX idx_edges_type ON akg_edges(type) WHERE is_active = TRUE;
CREATE INDEX idx_edges_from_type ON akg_edges(from_node, type) WHERE is_active = TRUE;
CREATE INDEX idx_edges_to_type ON akg_edges(to_node, type) WHERE is_active = TRUE;

-- Composite for prerequisite traversal
CREATE INDEX idx_edges_prereq ON akg_edges(from_node, to_node) 
    WHERE type = 'prerequisite_of' AND is_active = TRUE;

-- Full-text search on attributes
CREATE INDEX idx_nodes_fulltext ON akg_nodes 
    USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

### 6.3 Core Queries

```sql
-- Q1: Lấy tất cả prerequisites của một Topic
WITH RECURSIVE prereq_chain AS (
    -- Base case: trực tiếp
    SELECT e.from_node as node_id, n.name_vi, n.type, 1 as depth
    FROM akg_edges e
    JOIN akg_nodes n ON n.id = e.from_node
    WHERE e.to_node = 'addition-with-carry'
      AND e.type = 'prerequisite_of'
      AND e.is_active = TRUE
    
    UNION ALL
    
    -- Recursive: prerequisites của prerequisites
    SELECT e.from_node, n.name_vi, n.type, pc.depth + 1
    FROM akg_edges e
    JOIN akg_nodes n ON n.id = e.from_node
    JOIN prereq_chain pc ON pc.node_id = e.to_node
    WHERE e.type = 'prerequisite_of'
      AND e.is_active = TRUE
      AND pc.depth < 10  -- Max depth guard
)
SELECT DISTINCT node_id, name_vi, type, MIN(depth) as min_depth
FROM prereq_chain
GROUP BY node_id, name_vi, type
ORDER BY min_depth;

-- Q2: Lessons phù hợp cho học sinh 8 tuổi với mastery = 0.6
SELECT n.*, e.properties->>'suitability_score' as suitability
FROM akg_nodes n
JOIN akg_edges e ON e.from_node = n.id
WHERE n.type = 'Lesson'
  AND e.type = 'suitable_for'
  AND e.to_node = 'age-7-8'
  AND n.is_active = TRUE
  AND (n.attributes->>'difficulty')::int <= 3
ORDER BY (e.properties->>'suitability_score')::numeric DESC;

-- Q3: Tất cả Misconception liên quan đến Topic
SELECT m.*, e.properties
FROM akg_nodes m
JOIN akg_edges e ON e.to_node = m.id
JOIN akg_nodes c ON c.id = e.from_node
WHERE m.type = 'Misconception'
  AND c.type IN ('Concept', 'Skill')
  AND c.id IN (
    SELECT from_node FROM akg_edges
    WHERE to_node = 'addition-with-carry'
      AND type = 'is_a'
  );
```

### 6.4 Neo4j Alternative (Cypher)

```cypher
// Tạo node
CREATE (t:Topic {
  id: 'addition-with-carry',
  name: 'Addition with Carrying',
  name_vi: 'Phép cộng có nhớ',
  difficulty: 3,
  age_min: 7,
  age_max: 9
})

// Tạo prerequisite
MATCH (a:Topic {id: 'addition-basic'}), (b:Topic {id: 'addition-with-carry'})
CREATE (a)-[:PREREQUISITE_OF {strength: 'hard', mastery_threshold: 0.8}]->(b)

// Tìm learning path
MATCH path = (start:Topic {id: 'number-to-100'})-[:PREREQUISITE_OF*..10]->(end:Topic {id: 'addition-3-digit'})
RETURN path ORDER BY length(path) ASC LIMIT 1

// Cycle detection
MATCH (n)-[:PREREQUISITE_OF*]->(n)
RETURN n.id as cycle_node
```

---

## 7. API / Query Standard

### Base URL
```
https://api.avab.io/v1/knowledge-graph
```

### Authentication
```
Authorization: Bearer {avab_api_key}
X-AKG-Version: 1.0
```

### Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "query_time_ms": 12,
    "graph_version": "1.0.0",
    "timestamp": "2026-07-04T01:00:00Z"
  },
  "errors": []
}
```

---

### 7.1 GET /knowledge-graph/path

**Mô tả:** Tìm đường đi ngắn nhất / tối ưu giữa 2 node.

```
GET /knowledge-graph/path?from={node_id}&to={node_id}&edge_types={types}&strategy={strategy}
```

**Parameters:**
| Param | Required | Default | Mô tả |
|---|---|---|---|
| `from` | ✅ | — | Node xuất phát |
| `to` | ✅ | — | Node đích |
| `edge_types` | ❌ | `prerequisite_of` | Loại edge dùng để traverse |
| `strategy` | ❌ | `shortest` | `shortest/optimal/all` |
| `max_depth` | ❌ | `10` | Độ sâu tối đa |

**Response:**
```json
{
  "success": true,
  "data": {
    "path_id": "path-xyz-123",
    "from_node": "topic-number-to-100",
    "to_node": "topic-addition-3-digit",
    "strategy": "shortest",
    "total_estimated_hours": 6.5,
    "steps": [
      {
        "step_order": 1,
        "node_id": "topic-number-to-100",
        "node_type": "Topic",
        "node_name_vi": "Số đến 100",
        "estimated_hours": 1.0,
        "bloom_level": "Remember",
        "prerequisite_met": true
      },
      {
        "step_order": 2,
        "node_id": "topic-addition-basic",
        "node_type": "Topic",
        "node_name_vi": "Phép cộng cơ bản",
        "estimated_hours": 2.0,
        "bloom_level": "Apply",
        "prerequisite_met": false
      },
      {
        "step_order": 3,
        "node_id": "topic-addition-with-carry",
        "node_type": "Topic",
        "node_name_vi": "Phép cộng có nhớ",
        "estimated_hours": 2.5,
        "bloom_level": "Apply",
        "prerequisite_met": false
      },
      {
        "step_order": 4,
        "node_id": "topic-addition-3-digit",
        "node_type": "Topic",
        "node_name_vi": "Cộng 3 chữ số",
        "estimated_hours": 1.0,
        "bloom_level": "Apply",
        "prerequisite_met": false
      }
    ],
    "edges_traversed": [
      {"type": "prerequisite_of", "from": "topic-number-to-100", "to": "topic-addition-basic"},
      {"type": "prerequisite_of", "from": "topic-addition-basic", "to": "topic-addition-with-carry"},
      {"type": "prerequisite_of", "from": "topic-addition-with-carry", "to": "topic-addition-3-digit"}
    ]
  },
  "meta": { "query_time_ms": 8, "graph_version": "1.0.0" }
}
```

---

### 7.2 GET /knowledge-graph/prerequisites

**Mô tả:** Lấy toàn bộ chuỗi prerequisites của một lesson/topic.

```
GET /knowledge-graph/prerequisites?lesson={id}&depth={n}&include_met={bool}
```

**Parameters:**
| Param | Required | Default | Mô tả |
|---|---|---|---|
| `lesson` | ✅ | — | Lesson hoặc Topic ID |
| `depth` | ❌ | `5` | Độ sâu max |
| `include_met` | ❌ | `true` | Bao gồm prereq đã thỏa mãn |
| `student_id` | ❌ | — | Nếu có, filter theo mastery thực tế |

**Response:**
```json
{
  "success": true,
  "data": {
    "target": "lesson-addition-carry-g2-01",
    "prerequisites": [
      {
        "node_id": "topic-addition-basic",
        "name_vi": "Phép cộng cơ bản",
        "type": "Topic",
        "depth": 1,
        "strength": "hard",
        "mastery_threshold": 0.8,
        "student_mastery": null,
        "is_met": false
      },
      {
        "node_id": "concept-place-value",
        "name_vi": "Giá trị vị trí",
        "type": "Concept",
        "depth": 2,
        "strength": "hard",
        "mastery_threshold": 0.75,
        "student_mastery": null,
        "is_met": false
      }
    ],
    "total_unmet": 2,
    "estimated_hours_to_ready": 3.5
  }
}
```

---

### 7.3 GET /knowledge-graph/related

**Mô tả:** Lấy các node liên quan đến một concept, có filter theo tuổi.

```
GET /knowledge-graph/related?concept={id}&age={age}&limit={n}&types={node_types}
```

**Parameters:**
| Param | Required | Default | Mô tả |
|---|---|---|---|
| `concept` | ✅ | — | Concept hoặc Skill ID |
| `age` | ❌ | — | Tuổi học sinh để filter |
| `limit` | ❌ | `10` | Số kết quả tối đa |
| `types` | ❌ | `all` | Filter theo node type |
| `edge_types` | ❌ | `all` | Filter theo edge type |

**Response:**
```json
{
  "success": true,
  "data": {
    "source": "concept-carrying",
    "related": [
      {
        "node_id": "concept-place-value",
        "name_vi": "Giá trị vị trí",
        "type": "Concept",
        "relation": "requires",
        "relevance_score": 0.95,
        "age_suitable": true
      },
      {
        "node_id": "misc-carry-forget",
        "name_vi": "Quên nhớ khi cộng",
        "type": "Misconception",
        "relation": "corrects",
        "relevance_score": 0.88,
        "age_suitable": true
      },
      {
        "node_id": "resource-video-carry-animation",
        "name_vi": "Video: Số nhớ là gì?",
        "type": "Resource",
        "relation": "reinforces",
        "relevance_score": 0.82,
        "age_suitable": true
      }
    ]
  }
}
```

---

### 7.4 GET /knowledge-graph/learning-path

**Mô tả:** Tạo lộ trình học tập từ trạng thái hiện tại đến mục tiêu competency.

```
GET /knowledge-graph/learning-path?goal={competency_id}&current={mastery_json}&age={age}&grade={grade}
```

**Parameters:**
| Param | Required | Default | Mô tả |
|---|---|---|---|
| `goal` | ✅ | — | Competency ID |
| `current` | ❌ | `{}` | JSON mastery hiện tại: `{"topic-x": 0.8}` |
| `age` | ✅ | — | Tuổi học sinh |
| `grade` | ❌ | — | Khối lớp |
| `max_hours` | ❌ | `50` | Giới hạn tổng giờ học |
| `pace` | ❌ | `normal` | `slow/normal/fast` |

**Response:**
```json
{
  "success": true,
  "data": {
    "path_id": "lp-2026-abc-123",
    "goal": {
      "id": "mathematical-reasoning",
      "name_vi": "Lập luận toán học"
    },
    "student_context": {
      "age": 8,
      "grade": 2,
      "current_mastery": {"topic-addition-basic": 0.9}
    },
    "phases": [
      {
        "phase": 1,
        "name": "Nền tảng",
        "topics": ["addition-with-carry", "subtraction-basic"],
        "estimated_hours": 5.0,
        "bloom_focus": ["Remember", "Understand", "Apply"]
      },
      {
        "phase": 2,
        "name": "Phát triển",
        "topics": ["number-patterns", "simple-word-problems"],
        "estimated_hours": 7.0,
        "bloom_focus": ["Apply", "Analyze"]
      }
    ],
    "total_lessons": 12,
    "total_estimated_hours": 12.0,
    "completion_probability": 0.87,
    "difficulty_curve": "gradual"
  }
}
```

---

### 7.5 POST /knowledge-graph/validate

**Mô tả:** Kiểm tra tính hợp lệ của một path hoặc graph fragment.

```
POST /knowledge-graph/validate
Content-Type: application/json
```

**Request Body:**
```json
{
  "validate_type": "path",
  "nodes": ["topic-number-to-100", "topic-addition-with-carry"],
  "edges": [
    {"from": "topic-number-to-100", "to": "topic-addition-with-carry", "type": "prerequisite_of"}
  ],
  "checks": ["prerequisite_cycle", "bloom_consistency", "age_alignment", "orphan_nodes"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "score": 0.75,
    "checks": {
      "prerequisite_cycle": { "pass": true, "details": null },
      "bloom_consistency": { "pass": false, "details": "topic-addition-with-carry bloom=Apply nhưng prerequisite topic-number-to-100 bloom=Remember — OK" },
      "age_alignment": { "pass": true, "details": null },
      "orphan_nodes": { "pass": false, "details": ["topic-number-to-100 thiếu edge suitable_for"] }
    },
    "errors": [
      {
        "code": "MISSING_SUITABLE_FOR",
        "message": "topic-number-to-100 không có edge suitable_for AgeGroup",
        "severity": "warning",
        "node_id": "topic-number-to-100"
      }
    ],
    "recommendations": [
      "Thêm edge suitable_for từ topic-number-to-100 đến age-6-7 hoặc age-7-8"
    ]
  }
}
```

---

## 8. Sơ đồ minh họa: Bài toán Gà-Thỏ

### 8.1 Mô tả bài toán

> "Trong chuồng có 10 con gà và thỏ, đếm được 28 chân. Hỏi có bao nhiêu con gà, bao nhiêu con thỏ?"

Đây là bài toán đặc trưng của Toán Tư Duy cấp độ cao, yêu cầu tổng hợp nhiều kiến thức và kỹ năng.

---

### 8.2 Knowledge Graph đầy đủ

```
╔══════════════════════════════════════════════════════════════════╗
║              KNOWLEDGE GRAPH: BÀI TOÁN GÀ-THỎ                  ║
║              (Toán Tư Duy — Lớp 4/5 — ~10 tuổi)                ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━ SUBJECT / DOMAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Subject: Toán Tư Duy]
         │
    part_of
         │
    [Domain: Số học]────────────────[Domain: Logic & Lập luận]
         │                                    │
    part_of                              part_of
         │                                    │

━━━━━━━━━━━━━━━━━━━━ TOPICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Topic: Phép nhân]     [Topic: Bài toán có lời văn]
         │                          │
    part_of                    part_of
         │                          │
    [Domain: Số học]        [Domain: Giải toán]
         
    [Topic: Gà-Thỏ / Bài toán giả thiết-kết luận]
         │
    part_of────────────────────────────────┐
         │                                 │
    [Domain: Chiến lược giải toán]    [Domain: Logic]

━━━━━━━━━━━━━━━━━━ PREREQUISITES (chuỗi tiên quyết) ━━━━━━━━━

    [Concept: Số đến 100]
         │
    prerequisite_of (hard, threshold=0.8)
         ↓
    [Concept: Phép nhân cơ bản (2,4 chân)]
         │
    prerequisite_of (hard, threshold=0.85)
         ↓
    [Topic: Hệ phương trình đơn giản] ──or──→ [Skill: Phương pháp thử - sai]
         │                                              │
    prerequisite_of                              prerequisite_of
         ↓                                              ↓
    [Lesson: Bài toán Gà-Thỏ] ←──────────────────────┘
    (topic-chicken-rabbit)

━━━━━━━━━━━━━━━━━━ CONCEPTS (Khái niệm cần biết) ━━━━━━━━━━━

    [Lesson: Gà-Thỏ]
         │
    requires ──→ [Concept: Gà có 2 chân]
         │            (bloom: Remember)
    requires ──→ [Concept: Thỏ có 4 chân]
         │            (bloom: Remember)
    requires ──→ [Concept: Tổng số con = Gà + Thỏ]
         │            (bloom: Understand)
    requires ──→ [Concept: Tổng số chân = 2×Gà + 4×Thỏ]
         │            (bloom: Understand)
    requires ──→ [Concept: Phương pháp giả thiết]
                      (bloom: Apply)

━━━━━━━━━━━━━━━━━━━ SKILLS (Kỹ năng cần rèn) ━━━━━━━━━━━━━━━

    [Lesson: Gà-Thỏ]
         │
    requires ──→ [Skill: Đọc hiểu bài toán có lời văn]
         │            (bloom: Understand, type: strategic)
    requires ──→ [Skill: Lập bảng thử - sai]
         │            (bloom: Apply, type: procedural)
    requires ──→ [Skill: Đặt ẩn và lập phương trình]
         │            (bloom: Analyze, type: procedural)
    requires ──→ [Skill: Kiểm tra kết quả]
                      (bloom: Evaluate, type: procedural)

━━━━━━━━━━━━━━━━━━━━ COMPETENCIES ━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Skill: Đặt ẩn và lập phương trình]
         │
    leads_to ──→ [Competency: Lập luận toán học]
         │
    leads_to ──→ [Competency: Giải quyết vấn đề]
         │
    leads_to ──→ [Competency: Tư duy phản biện]

━━━━━━━━━━━━━━━━━━━ AGE GROUP & BLOOM ━━━━━━━━━━━━━━━━━━━━━━

    [Lesson: Gà-Thỏ]
         │
    suitable_for ──→ [AgeGroup: 9-10 tuổi (Lớp 4)]
         │                   suitability: 0.90
    suitable_for ──→ [AgeGroup: 10-11 tuổi (Lớp 5)]
                             suitability: 0.95

    BloomLevels covered:
    [Remember] → [Understand] → [Apply] → [Analyze] → [Evaluate]
                                                            ↑
                                              (kiểm tra kết quả)

━━━━━━━━━━━━━━━━━━━ MISCONCEPTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━

    [Lesson: Gà-Thỏ]
         │
    ←corrects── [Misconception: Nhầm số chân gà/thỏ]
    ←corrects── [Misconception: Không lập được hệ PT]
    ←corrects── [Misconception: Quên điều kiện tổng con]

━━━━━━━━━━━━━━━━━━━ RESOURCES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Lesson: Gà-Thỏ]
         │
    belongs_to ←── [Resource: Video hoạt hình Gà-Thỏ]
    belongs_to ←── [Resource: Worksheet: Bảng thử-sai]
    belongs_to ←── [Resource: Game: Xếp hình Gà-Thỏ]

━━━━━━━━━━━━━━━━━━━ ASSESSMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Assessment: Diagnostic — Gà-Thỏ cơ bản]
         │
    assesses ──→ [Skill: Lập bảng thử-sai]
    assesses ──→ [Concept: Tổng số chân]
    
    [Assessment: Formative — Gà-Thỏ mở rộng]  
         │
    assesses ──→ [Skill: Đặt ẩn và lập phương trình]
    assesses ──→ [Competency: Lập luận toán học]
```

### 8.3 Tóm tắt Graph Stats

| Metric | Giá trị |
|---|---|
| Tổng nodes | 22 |
| Tổng edges | 31 |
| Độ sâu prerequisite | 3 |
| Bloom levels covered | 5/6 (Remember→Evaluate) |
| Misconceptions mapped | 3 |
| Age groups | 2 |

---

## 9. Integration với A2PLM

### 9.1 A2PLM Overview

A2PLM (AvaB Adaptive Probabilistic Learning Model) là hệ thống BKT nâng cao của AvaB:

```
P(L_t) = P(mastery tại thời điểm t)

BKT Parameters per Skill/Concept node:
  P(L_0)   = P(học sinh đã biết trước khi học)
  P(T)     = P(transit: học xong và nắm được)
  P(S)     = P(slip: biết nhưng trả lời sai)
  P(G)     = P(guess: không biết nhưng đoán đúng)
```

### 9.2 Graph Node → BKT Mapping

```
┌─────────────────────────────────────────────────────────────┐
│              Knowledge Graph → BKT Integration              │
└─────────────────────────────────────────────────────────────┘

For each (Concept | Skill) node in AKG:
  → Create BKT parameter set in A2PLM:

  skill_node.id  ←→  bkt.skill_id
  skill_node.difficulty  →  bkt.P(L_0) calibration
  skill_node.cognitive_load  →  bkt.P(S) calibration
  
For each Assessment node:
  → Maps to BKT observation (correct/incorrect)
  
For each edge (prerequisite_of):
  → A2PLM checks P(L_t) of prerequisite
  → If P(L_t) < mastery_threshold: BLOCK lesson
  → If P(L_t) >= mastery_threshold: UNLOCK lesson

┌─────────────────────────────────────────────────────────────┐
│                    BKT Update Flow                          │
└─────────────────────────────────────────────────────────────┘

Student answers question
         ↓
Assessment node → assesses → Skill/Concept node
         ↓
A2PLM receives: (skill_id, is_correct)
         ↓
Update: P(L_t+1) = P(L_t|evidence)
         ↓
Write back to student mastery profile
         ↓
Check: P(L_t+1) >= mastery_threshold?
         ↓
    YES → Mark node as MASTERED → UNLOCK next in graph
    NO  → Recommend: reinforces resources OR corrects misconception
```

### 9.3 Adaptive Learning Path với Graph

```python
# Pseudocode: Adaptive Path Selection
def get_next_lesson(student_id, current_topic_id, a2plm):
    """
    Dùng Knowledge Graph + BKT để chọn bài học tiếp theo
    """
    
    # 1. Lấy mastery hiện tại từ A2PLM
    mastery = a2plm.get_mastery(student_id)
    
    # 2. Query graph: tìm lessons chưa mastered
    candidates = graph.query("""
        SELECT lesson_nodes 
        WHERE topic = current_topic_id
          AND suitable_for.age_group = student.age_group
          AND ALL prerequisites.mastery >= threshold
          AND student_mastery < 0.8
        ORDER BY difficulty ASC, bloom_level ASC
    """)
    
    # 3. Nếu không có candidate → học topic tiếp theo
    if not candidates:
        next_topic = graph.get_next_topic(current_topic_id)
        return get_next_lesson(student_id, next_topic, a2plm)
    
    # 4. Điều chỉnh theo learning pace
    student_pace = a2plm.get_learning_rate(student_id)
    
    if student_pace > 1.2:  # Fast learner
        return candidates[2]  # Harder lesson
    elif student_pace < 0.8:  # Slow learner
        # Find reinforcement resource first
        reinforcement = graph.get_reinforcement(current_topic_id)
        return reinforcement or candidates[0]
    else:
        return candidates[0]  # Normal difficulty
    
    # 5. Check misconceptions
    misconceptions = a2plm.get_likely_misconceptions(student_id, current_topic_id)
    if misconceptions:
        correction = graph.get_corrective_resource(misconceptions[0])
        # Insert correction before next lesson
        return correction

# Pseudocode: Mastery Update + Graph Unlock
def on_assessment_complete(student_id, assessment_id, is_correct, a2plm, graph):
    """
    Cập nhật graph mastery khi học sinh hoàn thành assessment
    """
    
    # 1. Lấy Skill/Concept từ Assessment qua graph
    skills = graph.get_assessed_skills(assessment_id)
    
    # 2. Update BKT cho từng skill
    for skill_id in skills:
        new_mastery = a2plm.update(student_id, skill_id, is_correct)
        
        # 3. Nếu đạt threshold → check xem có unlock được gì
        threshold = graph.get_mastery_threshold(skill_id)
        if new_mastery >= threshold:
            unlocked = graph.get_unlocked_nodes(skill_id, student_id)
            notify_student(unlocked)
    
    # 4. Update Misconception tracking
    if not is_correct:
        misconceptions = graph.get_possible_misconceptions(assessment_id)
        a2plm.flag_misconception(student_id, misconceptions)
```

### 9.4 Graph Update khi Student Mastery Thay đổi

```
EVENT: Student mastery for "skill-add-two-digit-carry" → 0.87 (threshold: 0.85)

GRAPH ACTIONS:
1. Mark edge (lesson → skill, "assesses") with student_mastery=0.87
2. Traverse: skill → prerequisite_of → next_lessons
3. For each next_lesson:
   a. Check ALL prerequisites satisfied
   b. If all satisfied → add to student's available_lessons
4. Update student's learning_path_progress:
   - Step 3 (addition-with-carry) → COMPLETED
   - Step 4 (addition-3-digit) → NOW AVAILABLE
5. Log event for analytics:
   {
     "event": "mastery_achieved",
     "student_id": "...",
     "skill_id": "skill-add-two-digit-carry",
     "mastery": 0.87,
     "unlocked": ["topic-addition-3-digit"],
     "timestamp": "2026-07-04T01:30:00Z"
   }
```

### 9.5 Knowledge Graph → Prompt Engineering

Khi AI cần sinh nội dung (lesson, explanation, question), graph cung cấp context:

```json
{
  "ai_context": {
    "target_concept": "carrying-concept",
    "student_age": 8,
    "bloom_level": "Understand",
    "known_prerequisites": ["place-value", "addition-basic"],
    "known_misconceptions": ["misc-carry-forget"],
    "preferred_format": ["visual", "story"],
    "avoid_concepts": [],
    "language_complexity": "grade-2-level",
    "real_world_context": "mua đồ, đếm điểm"
  }
}
```

→ AI dùng context này để sinh explanation phù hợp, không giải thích lại prereqs đã biết, chủ động sửa misconception tiềm ẩn.

---

## 10. QA Checklist cho Knowledge Graph

### 10.1 Checklist Cấu trúc Node

```
☐ NODE COMPLETENESS
  ☐ Mọi Node có đủ required attributes theo schema
  ☐ ID theo đúng format slug (lowercase, dấu gạch ngang)
  ☐ ID không trùng lặp toàn graph
  ☐ version field hợp lệ (semantic versioning)
  ☐ name_vi không bỏ trống
  ☐ Mọi Lesson có ít nhất 1 concept_id và 1 skill_id
  ☐ Mọi Concept có examples (≥2 ví dụ)
  ☐ Mọi Misconception có correction_strategy và detection_pattern
  ☐ Mọi Skill có mastery_criteria.accuracy_threshold

  VÍ DỤ SAI: {"id": "AddCarry", "type": "Topic"} — ID có chữ hoa
  VÍ DỤ ĐÚNG: {"id": "addition-with-carry", "type": "Topic"}
```

### 10.2 Checklist Edge Integrity

```
☐ EDGE VALIDITY
  ☐ Không có orphan edges (from/to phải tồn tại trong graph)
  ☐ Không có self-loop (from != to)
  ☐ Edge type hợp lệ theo danh sách 11 types
  ☐ Valid pairs theo quy định (Subject không is_a Concept,...)
  
☐ PREREQUISITE INTEGRITY
  ☐ Không có cycle trong prerequisite_of edges (DAG check)
  ☐ Mọi Lesson có ít nhất 1 prerequisite_of (trừ introductory)
  ☐ Mọi prerequisite có strength attribute
  ☐ mastery_threshold: hard≥0.8, soft≥0.6, recommended≥0.5
  
  PHƯƠNG PHÁP KIỂM TRA CYCLE:
  → Chạy DFS từ mọi node; nếu gặp ancestor → có cycle
  → SQL: tìm path có độ dài > 0 từ N về lại N
  
  VÍ DỤ LỖI: A→B→C→A (cycle)
  FIX: Xóa edge yếu nhất (C→A, strength=soft)
```

### 10.3 Checklist Bloom Consistency

```
☐ BLOOM ALIGNMENT
  ☐ BloomLevel của Lesson ≥ BloomLevel của tất cả prerequisites
     (Không thể Analyze nếu chưa Apply)
  ☐ Assessment.bloom_alignment khớp với loại câu hỏi
  ☐ Objectives dùng đúng action verbs cho bloom level
  
  BLOOM ORDER: Remember(1) < Understand(2) < Apply(3) 
             < Analyze(4) < Evaluate(5) < Create(6)
  
  VÍ DỤ SAI: Lesson bloom=Apply nhưng objective là "Học sinh tìm quy luật"
              (tìm quy luật = Analyze, không phải Apply)
  VÍ DỤ ĐÚNG: bloom=Analyze, objective "Học sinh PHÂN TÍCH quy luật dãy số"
```

### 10.4 Checklist Age Alignment

```
☐ AGE/GRADE ALIGNMENT  
  ☐ Mọi Lesson có ít nhất 1 edge suitable_for → AgeGroup
  ☐ Topic.age_min ≤ Lesson.age_group.age_min
  ☐ Topic.age_max ≥ Lesson.age_group.age_max
  ☐ Difficulty phù hợp với AgeGroup
     (age 5-6: max difficulty 2; age 7-8: max 3; age 9-10: max 4; age 11-12: max 5)
  ☐ Duration phù hợp với attention_span của AgeGroup
     (age 5-6: max 20 phút; age 7-8: max 30 phút; age 9+: max 45 phút)
  
  VÍ DỤ SAI: Lesson difficulty=5, suitable_for age-5-6 — quá khó
  FIX: Đổi suitable_for thành age-9-10 hoặc giảm difficulty
```

### 10.5 Checklist Misconception Coverage

```
☐ MISCONCEPTION COVERAGE
  ☐ Mọi Topic có ít nhất 1 Misconception được document
  ☐ Mọi Misconception có ít nhất 1 corrects ← Resource/Activity
  ☐ detection_pattern có thể implement được (không chung chung)
  ☐ frequency được xác nhận bởi data thực tế (hoặc flag as estimated)
  
  VÍ DỤ SAI detection_pattern: "khi học sinh tính sai"
  VÍ DỤ ĐÚNG: "result == sum_of_digits_without_carry_propagation"
```

### 10.6 Checklist Cross-Topic Consistency

```
☐ CROSS-TOPIC CONSISTENCY
  ☐ Skill được dùng trong nhiều Topic phải có cùng ID (không duplicate)
  ☐ Concept definition nhất quán dù xuất hiện ở nhiều chỗ
  ☐ Khi thêm môn mới, check shared skills với môn cũ
  
  VÍ DỤ: "Logical Reasoning" không nên có 2 node khác nhau:
    skill-logical-reasoning (Toán) và skill-logic-reasoning (Tin học)
  FIX: Merge thành 1 node, link từ cả 2 Subject
```

### 10.7 Checklist API & Schema

```
☐ API VALIDATION
  ☐ Mọi endpoint có response time < 200ms (p95)
  ☐ Path query không trả về cycle
  ☐ Prerequisite query trả về đúng depth (max_depth không bị ignore)
  ☐ Validate endpoint phát hiện đúng các lỗi trong test cases
  
☐ SCHEMA VALIDATION
  ☐ Tất cả nodes pass JSON schema validation
  ☐ Không có extra fields không documented
  ☐ Date fields đúng format ISO 8601
```

### 10.8 Checklist BKT/A2PLM Integration

```
☐ BKT INTEGRATION
  ☐ Mọi Skill/Concept node có BKT parameter set trong A2PLM
  ☐ P(L_0), P(T), P(S), P(G) được calibrate (không dùng default cho mọi node)
  ☐ mastery_threshold trong graph khớp với threshold trong A2PLM
  ☐ Assessment assesses ít nhất 1 tracked skill (không orphan assessment)
  ☐ Khi mastery thay đổi, graph unlock chính xác các node kế tiếp
  
☐ LEARNING PATH QUALITY
  ☐ Path không có gap (mọi step có prerequisite đầy đủ)
  ☐ Difficulty curve là gradual (không nhảy vọt từ 2 lên 5)
  ☐ Path estimate hours realistic (compare với pilot data)
```

### 10.9 QA Process Workflow

```
Phase 1 — BUILD: Curriculum team tạo nodes/edges
         ↓
Phase 2 — AUTO-VALIDATE: POST /validate chạy automated checks
         ↓
Phase 3 — PEER REVIEW: 1 GV khác review logic prerequisite
         ↓
Phase 4 — PILOT TEST: Thử với 5–10 học sinh thật
         ↓
Phase 5 — A2PLM CALIBRATION: Điều chỉnh BKT params dựa trên data
         ↓
Phase 6 — PRODUCTION MERGE: Merge vào main graph, bump version
         ↓
Phase 7 — MONITORING: Track completion rate, misconception rate
```

### 10.10 KPI của Graph Quality

| KPI | Target | Cảnh báo |
|---|---|---|
| Node completeness rate | ≥ 98% | < 95% |
| Orphan node rate | 0% | > 0% |
| Prerequisite cycle count | 0 | > 0 |
| Misconception coverage (Topics có ≥1) | ≥ 90% | < 80% |
| Assessment coverage (Skills có ≥1) | ≥ 95% | < 85% |
| Path API p95 latency | < 100ms | > 200ms |
| BKT calibration RMSE | < 0.15 | > 0.25 |
| Learning path completion rate (students) | ≥ 70% | < 50% |

---

## Phụ lục A: Danh sách Node Types nhanh

| Type | Viết tắt | Ví dụ ID |
|---|---|---|
| Subject | SUB | `math-thinking` |
| Domain | DOM | `arithmetic` |
| Topic | TOP | `addition-with-carry` |
| Concept | CON | `carrying-concept` |
| Skill | SKL | `skill-add-two-digit-carry` |
| Competency | CMP | `mathematical-reasoning` |
| Lesson | LES | `lesson-addition-carry-g2-01` |
| Prerequisite | PRE | `prereq-001` |
| AgeGroup | AGE | `age-7-8` |
| BloomLevel | BLM | `bloom-3-apply` |
| Resource | RES | `resource-video-carry-anim` |
| Assessment | ASS | `assess-carry-g2-formative` |
| Misconception | MIS | `misc-carry-forget` |

## Phụ lục B: Edge Quick Reference

| Edge | From → To | Bắt buộc |
|---|---|---|
| `is_a` | Concept/Topic/Domain/Skill → cha | ✅ |
| `part_of` | Topic/Domain/Lesson → cha | ✅ |
| `prerequisite_of` | Topic/Lesson/Skill → tiếp theo | ✅ khi có tiên quyết |
| `requires` | Lesson → Concept/Skill | ✅ |
| `leads_to` | Skill/Topic → Competency | ✅ khi có |
| `supports` | Topic → Topic | ❌ optional |
| `belongs_to` | Resource/Assessment → Topic | ✅ |
| `suitable_for` | Lesson/Resource → AgeGroup | ✅ |
| `assesses` | Assessment → Concept/Skill | ✅ |
| `corrects` | Resource/Activity → Misconception | ✅ khi có Misconception |
| `reinforces` | Resource/Game → Concept/Skill | ❌ optional |

---

*AvaB Knowledge Graph Standard v1.0 — Tài liệu nội bộ AvaB AI Team*  
*Phiên bản tiếp theo: v1.1 sẽ bổ sung Cross-Subject Graph và Multi-language Support*
