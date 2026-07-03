# AvaB EOS v2.0 — Executive Summary (Tóm tắt Điều hành)

> **Date:** 2026-07-04  
> **Version:** 2.0  
> **Status:** Architecture Planning

---

## 1. Tầm Nhìn — AvaB Education Operating System

AvaB không còn là một Learning Management System (LMS) hay phần mềm quản lý trường học thông thường. **AvaB EOS v2.0** là một **Education Operating System** — hệ điều hành giáo dục toàn diện cho phép tổ chức giáo dục vận hành, phân tích và phát triển toàn bộ hoạt động từ một nền tảng thống nhất duy nhất.

### Tầm nhìn 5 năm
> *"Mọi trung tâm giáo dục, từ 1 cơ sở đến chuỗi 50 campus, đều vận hành bằng AvaB như một operating system — không cần bất kỳ phần mềm nào khác."*

### Định nghĩa lại thị trường

| Phân khúc | Ví dụ | Vấn đề |
|-----------|-------|--------|
| LMS thuần túy | Google Classroom, Moodle | Chỉ quản lý bài giảng, không có ERP/Finance |
| ERP giáo dục | SMAS, VnEdu | Quản lý hành chính, không có AI, UX kém |
| CRM riêng | Hubspot, Salesforce | Không tích hợp với ERP học sinh |
| Phần mềm lương riêng | HRM rời | Data silos, không liên kết |
| **AvaB EOS v2.0** | **All-in-one** | **Tất cả trong một, AI-powered, Multi-Campus** |

---

## 2. So Sánh AvaB EOS vs Giải Pháp Thông Thường

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIẢI PHÁP THÔNG THƯỜNG                       │
│                                                                 │
│  [LMS] + [ERP riêng] + [CRM riêng] + [HRM riêng] + [Excel]   │
│     ↕          ↕            ↕             ↕            ↕       │
│   Data     Data silos   Data silos    Data silos   Manual     │
│   silos    No sync      No sync       No sync      reports    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       AVAB EOS v2.0                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Unified Data Platform                       │  │
│  │  Organization → Campus → Dept → Year → Class → Student  │  │
│  └──────────────────────────────────────────────────────────┘  │
│         ↑           ↑          ↑          ↑          ↑         │
│  [School ERP]  [Finance]   [CRM]      [HRM]    [Analytics]    │
│  [AI Timetable] [Collab]  [Mobile]  [App Center] [AI Decision] │
└─────────────────────────────────────────────────────────────────┘
```

### Lợi ích định lượng

| Chỉ số | Trước AvaB | Sau AvaB EOS |
|--------|------------|--------------|
| Thời gian lên TKB | 3–5 ngày thủ công | 30 phút (AI) |
| Báo cáo tháng | 2 ngày tổng hợp | Real-time dashboard |
| Tỷ lệ học sinh bỏ học không dự báo được | ~35% | <5% (AI cảnh báo sớm) |
| Quản lý đa cơ sở | Không đồng nhất | Unified, consolidated |
| Sai sót hóa đơn học phí | ~8% | <0.1% |

---

## 3. Kiến Trúc 11 Modules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AvaB EOS v2.0 — 11 Modules                         │
├─────────────────┬─────────────────┬─────────────────┬────────────────────────┤
│  CORE ACADEMIC  │  BUSINESS OPS   │  INTELLIGENCE   │    PLATFORM            │
├─────────────────┼─────────────────┼─────────────────┼────────────────────────┤
│ 1. School ERP   │ 2. Finance ERP  │ 6. Analytics    │ 8. App Center          │
│    - Students   │    - Tuition    │    Center       │    - Marketplace       │
│    - Teachers   │    - Invoices   │    - Dashboards │    - Plugins           │
│    - Classes    │    - Payments   │    - Drill-down │    - API/Webhook        │
│    - Rooms      │    - Vouchers   │                 │    - Integrations       │
│    - Equipment  │    - Scholarships│ 7. AI Decision │                        │
│    - Timetable  │    - Installment│    Center       │ 9. Mobile App          │
│    - Attendance │    - Cash Flow  │    - Auto Alert │    - Teacher App        │
│    - Health     │    - Forecast   │    - Prediction │    - Student App        │
│    - Alumni     │                 │    - Recommend  │    - Parent App        │
│                 │ 3. CRM          │                 │    - Owner App         │
│ 11. AI Timetable│    - Lead Mgmt  │                 │                        │
│    Engine       │    - Pipeline   │                 │ 10. Multi-Campus       │
│    - AI Generate│    - Campaign   │                 │    Management          │
│    - Constraints│                 │                 │    - Consolidated view │
│    - Conflicts  │ 4. HRM          │                 │    - Cross-campus      │
│    - Academic   │    - Staff      │                 │    - Transfer mgmt     │
│    Calendar     │    - Payroll    │                 │                        │
│                 │    - KPI/OKR    │                 │                        │
│                 │    - Leaves     │                 │                        │
│                 │                 │                 │                        │
│                 │ 5. Collaboration│                 │                        │
│                 │    - Calendar   │                 │                        │
│                 │    - Meeting    │                 │                        │
│                 │    - Tasks      │                 │                        │
│                 │    - Approvals  │                 │                        │
└─────────────────┴─────────────────┴─────────────────┴────────────────────────┘
```

---

## 4. Ba Điểm Khác Biệt Cạnh Tranh (Unique Differentiators)

### 🤖 Điểm khác biệt #1: AI Timetable Engine
- **Vấn đề hiện tại:** Lập TKB là bài toán tối ưu hóa NP-hard — hầu hết làm thủ công 3-5 ngày, xung đột nhiều
- **AvaB giải quyết:** AI tự động generate TKB tối ưu trong 30 phút với constraint engine
- **Input constraints:** Giáo viên rảnh/bận, phòng học, môn học, số tiết/tuần, nghỉ lễ, ưu tiên sáng/chiều
- **Output:** TKB không xung đột, phân bổ tài nguyên tối ưu, xuất PDF/Excel/iCal
- **USP:** Không có LMS/ERP nào ở thị trường Việt Nam có tính năng này

### 🏢 Điểm khác biệt #2: Multi-Campus Management
- **Vấn đề hiện tại:** Chuỗi trung tâm dùng nhiều phần mềm khác nhau hoặc Excel riêng từng cơ sở
- **AvaB giải quyết:** Architecture-first Multi-Campus — dữ liệu tách biệt theo campus nhưng báo cáo consolidated
- **Features:** Transfer học sinh giữa cơ sở, staff sharing, unified finance report, cross-campus analytics
- **USP:** Scale từ 1 → 100 campus mà không cần thay đổi kiến trúc

### 🧠 Điểm khác biệt #3: AI Decision Center
- **Vấn đề hiện tại:** Chủ trường nhận data thô, phải tự phân tích, quyết định dựa vào "cảm giác"
- **AvaB giải quyết:** AI proactively alert, predict, và recommend với context đầy đủ
- **Alerts:** "Lớp A3 có 4/15 học sinh có nguy cơ nghỉ học tháng tới"
- **Predictions:** "Doanh thu tháng 9 dự báo giảm 23% nếu không mở thêm lớp"
- **Recommendations:** "Nên tuyển thêm 2 GV Toán tại Campus Q7 trước tháng 8"

---

## 5. Data Hierarchy

```
Organization (Tổ chức/Thương hiệu)
└── Campus / Branch (Cơ sở)
    ├── Department (Bộ môn: Toán, Lý, Tiếng Anh...)
    │   └── Teacher assignments
    └── Academic Year (Năm học: 2025-2026)
        └── Semester (Học kỳ 1, 2)
            └── Grade (Khối: 1-12)
                └── ClassRoom (Lớp: 10A1, 11B2...)
                    └── Course (Môn học trong lớp)
                        └── Lesson (Buổi học cụ thể)
```

---

## 6. Lộ Trình 4 Phase

### Phase 1: Foundation (Tháng 1-4) — *"Core EOS Platform"*
**Mục tiêu:** Nền tảng hoạt động được với đa cơ sở

| Module | Tasks | Ước tính |
|--------|-------|---------|
| Multi-Campus Architecture | DB schema, tenant isolation, org hierarchy | 3 tuần |
| School ERP v2 | Students, Teachers, Classes, Rooms, Equipment | 6 tuần |
| Academic Calendar | Năm học, học kỳ, lịch nghỉ lễ | 2 tuần |
| Basic RBAC | Roles mới: Principal, Academic Dir, etc. | 2 tuần |
| Organization Hub | Dashboard cơ sở, settings | 2 tuần |

**Tổng Phase 1: ~15 tuần (4 tháng)**

---

### Phase 2: Operations (Tháng 5-8) — *"Business Modules"*
**Mục tiêu:** Tất cả nghiệp vụ vận hành đầy đủ

| Module | Tasks | Ước tính |
|--------|-------|---------|
| Finance ERP đầy đủ | Invoice, Payment, Voucher, Scholarship, Installment | 6 tuần |
| CRM Pipeline | Lead → Alumni full flow | 4 tuần |
| HRM | Staff, Timesheet, Leave, Payroll, KPI | 5 tuần |
| Collaboration | Calendar, Meeting, Task, Approval | 4 tuần |
| AI Timetable Engine | Constraint input, AI generate, conflict resolve | 6 tuần |

**Tổng Phase 2: ~25 tuần (6 tháng, parallel teams)**

---

### Phase 3: Intelligence (Tháng 9-11) — *"AI Layer"*
**Mục tiêu:** Biến data thành insights hành động được

| Module | Tasks | Ước tính |
|--------|-------|---------|
| Analytics Center | Per-role dashboards, drill-down, export | 4 tuần |
| AI Decision Center | Alert engine, prediction models, recommendations | 6 tuần |
| AI Meeting Minutes | Transcription → Auto summary → Tasks | 3 tuần |
| Predictive Finance | Revenue forecast, churn prediction | 4 tuần |

**Tổng Phase 3: ~17 tuần (4 tháng)**

---

### Phase 4: Ecosystem (Tháng 12-15) — *"Platform & Scale"*
**Mục tiêu:** Trở thành platform cho ecosystem giáo dục

| Module | Tasks | Ước tính |
|--------|-------|---------|
| Mobile Apps | Teacher, Student, Parent, Owner apps | 8 tuần |
| App Center | Marketplace, Plugin system, Public API | 6 tuần |
| Integrations | Zoom, Zalo, VNPay, MoMo, Google Workspace | 4 tuần |
| Multi-Campus Advanced | Cross-campus analytics, transfer workflows | 3 tuần |

**Tổng Phase 4: ~21 tuần (5 tháng)**

---

## 7. Tóm Tắt Timeline

```
2026 Q3          2026 Q4          2027 Q1          2027 Q2
│────────────────│────────────────│────────────────│────────────
│  Phase 1       │  Phase 2       │  Phase 3       │  Phase 4
│  Foundation    │  Operations    │  Intelligence  │  Ecosystem
│  (4 tháng)     │  (3 tháng)     │  (3 tháng)     │  (4 tháng)
│                │                │                │
│  Multi-Campus  │  Finance ERP   │  Analytics     │  Mobile Apps
│  School ERP v2 │  CRM           │  AI Decision   │  App Center
│  Org Hub       │  HRM           │  AI Timetable  │  Integrations
│  RBAC v2       │  Collaboration │  Predictions   │  Public API
```

**Tổng thời gian: ~14 tháng** (với 3-4 development teams parallel)

---

## 8. Thành Công Criteria

| Phase | Success Metric |
|-------|---------------|
| Phase 1 | Trung tâm đa cơ sở đầu tiên go-live, quản lý được học sinh/TKB |
| Phase 2 | Finance tự động hóa 90% quy trình thu học phí |
| Phase 3 | AI cảnh báo chính xác >80% học sinh có nguy cơ nghỉ học |
| Phase 4 | App Center có >10 integrations, Mobile MAU >5,000 |

---

*Document prepared by AvaB Architecture Team — 2026-07-04*
