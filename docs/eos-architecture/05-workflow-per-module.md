# AvaB EOS v2.0 — Workflow Per Module (Quy trình từng Module)

> **Date:** 2026-07-04  
> **Version:** 2.0  
> **Status:** Architecture Planning

---

## 1. CRM Workflow — Lead đến Alumni

### 1.1 Stages Pipeline

```mermaid
flowchart LR
    A([🆕 New Lead]) --> B[Contacted\nĐã liên hệ]
    B --> C{Quan tâm?}
    C -->|Có| D[Consulting\nTư vấn]
    C -->|Không| E([❌ Lost])
    D --> F{Fit?}
    F -->|Yes| G[Trial\nHọc thử]
    F -->|No| E
    G --> H{Ấn tượng?}
    H -->|Có| I[Enrollment\nĐăng ký]
    H -->|Không| E
    I --> J[Payment\nĐóng tiền]
    J --> K([✅ Active Student])
    K --> L{Sắp hết hạn?}
    L -->|>30 ngày| K
    L -->|≤30 ngày| M[Renewal\nGia hạn]
    M --> N{Gia hạn?}
    N -->|Có| K
    N -->|Không| O([🎓 Alumni])

    style A fill:#1565C0,color:#fff
    style K fill:#1B5E20,color:#fff
    style O fill:#6A1B9A,color:#fff
    style E fill:#B71C1C,color:#fff
```

### 1.2 Detailed CRM Flow

```mermaid
flowchart TD
    subgraph LEAD_IN["📥 Lead Intake"]
        L1[Lead từ Facebook Ad] --> L4[Tạo Lead record]
        L2[Lead từ Zalo OA] --> L4
        L3[Lead từ Referral/Walk-in] --> L4
        L4 --> L5[Auto-assign cho Sales\ntheo round-robin/campus]
        L5 --> L6[Trigger: Thông báo Sales\nqua Zalo/App]
    end

    subgraph CONSULT["📞 Tư vấn"]
        C1[Sales nhận thông báo] --> C2[Gọi điện/Chat trong 4h]
        C2 --> C3{Trả lời?}
        C3 -->|Có| C4[Log cuộc gọi\nGhi chú nhu cầu]
        C3 -->|Không| C5[Schedule follow-up\n+24h]
        C4 --> C6[Move stage: Consulting]
        C5 --> C2
        C6 --> C7[Schedule học thử]
    end

    subgraph TRIAL["🎯 Học thử"]
        T1[Tạo Trial Session] --> T2[Gửi thông báo cho PH/HS]
        T2 --> T3[HS tham gia học thử]
        T3 --> T4[GV đánh giá\nSales nhận feedback]
        T4 --> T5{Kết quả?}
        T5 -->|Đăng ký| T6[Move: Enrollment]
        T5 -->|Suy nghĩ thêm| T7[Follow-up sau 3 ngày]
        T5 -->|Không phù hợp| T8[Mark Lost\nGhi lý do]
        T7 --> T5
    end

    subgraph ENROLL["📝 Đăng ký"]
        E1[Chọn gói học phí] --> E2[Áp dụng Voucher/Học bổng]
        E2 --> E3[Tạo hóa đơn tự động]
        E3 --> E4[Xác nhận đăng ký]
        E4 --> E5[Tạo Student Profile]
        E5 --> E6[Assign vào lớp]
        E6 --> E7[Gửi welcome package\nZalo/Email]
        E7 --> E8[Lead → Active Student\nCRM closed won]
    end

    LEAD_IN --> CONSULT --> TRIAL --> ENROLL
```

---

## 2. Finance Workflow — Tạo đến Ghi nhận Doanh thu

```mermaid
flowchart TD
    subgraph CREATE["📋 Tạo Hóa Đơn"]
        F1{Nguồn tạo HĐ} --> F2[Manual: Kế toán tạo]
        F1 --> F3[Auto: Khi đăng ký mới]
        F1 --> F4[Auto: Đầu kỳ gia hạn]
        F2 & F3 & F4 --> F5[Áp dụng gói học phí]
        F5 --> F6{Có Voucher/Học bổng?}
        F6 -->|Có| F7[Validate & Apply discount]
        F6 -->|Không| F8[Tính tổng tiền]
        F7 --> F8
        F8 --> F9{Trả góp?}
        F9 -->|Có| F10[Tạo InstallmentPlan]
        F9 -->|Không| F11[Invoice status: PENDING]
        F10 --> F11
    end

    subgraph NOTIFY["📢 Thông Báo"]
        N1[Gửi hóa đơn qua Email] --> N3[Phụ huynh nhận thông báo]
        N2[Gửi qua Zalo OA] --> N3
        N3 --> N4{Phản hồi trong 48h?}
        N4 -->|Không| N5[Auto reminder\nngày 3, 7, 14]
        N4 -->|Có| P1
        N5 --> N4
    end

    subgraph PAY["💳 Thanh Toán"]
        P1[Chọn hình thức thanh toán]
        P1 --> P2[Online: VNPay/MoMo]
        P1 --> P3[Transfer: Ngân hàng]
        P1 --> P4[Cash: Tại quầy]
        P2 --> P5[Payment Gateway callback]
        P3 --> P6[Kế toán xác nhận thủ công]
        P4 --> P6
        P5 & P6 --> P7[Payment record: CONFIRMED]
    end

    subgraph CONFIRM["✅ Xác Nhận & Cập Nhật"]
        R1[Invoice status: PAID] --> R2[Enrollment status: ACTIVE]
        R2 --> R3[Gửi receipt/biên lai]
        R3 --> R4[Cập nhật student access]
        R4 --> R5[Ghi nhận doanh thu\nvào cash flow]
        R5 --> R6[Update analytics\ndashboard real-time]
    end

    subgraph OVERDUE["⚠️ Quá Hạn"]
        O1[Invoice quá dueDate] --> O2[Auto: Alert kế toán]
        O2 --> O3[Auto: Reminder PH lần 1]
        O3 --> O4{30 ngày không TT?}
        O4 -->|Tiếp tục| O5[Reminder PH lần 2\n+ Principal notify]
        O4 -->|Thanh toán| P1
        O5 --> O6{60 ngày không TT?}
        O6 -->|Tiếp tục| O7[Suspend student access\n+ Mark overdue]
        O6 -->|Thanh toán| P1
    end

    CREATE --> NOTIFY --> PAY --> CONFIRM
    CREATE --> OVERDUE
```

---

## 3. AI Timetable Workflow

```mermaid
flowchart TD
    subgraph INPUT["📥 Input Phase"]
        I1[Chọn Semester\ncần lập TKB] --> I2[Import danh sách lớp học]
        I2 --> I3[Import GV & phân công môn]
        I3 --> I4[Import phòng học\n& capacity]
        I4 --> I5[Nhập Hard Constraints]
        I5 --> I6[Nhập Soft Constraints]
        
        I5 -->|Ví dụ| HC["Hard Constraints:\n- GV không dạy 2 lớp cùng lúc\n- Phòng không dùng 2 lớp cùng lúc\n- Số tiết/tuần theo môn"]
        I6 -->|Ví dụ| SC["Soft Constraints:\n- GV ưu tiên sáng/chiều\n- Toán không tiết 5\n- Không dạy 4 tiết liên tục"]
    end

    subgraph GENERATE["🤖 AI Generate Phase"]
        G1[Validate constraints\nnhất quán không?] --> G2{Valid?}
        G2 -->|Có conflict| G3[Báo lỗi\ngợi ý sửa]
        G2 -->|OK| G4[AI Optimization Engine\nchạy scheduling]
        G4 --> G5[Backtracking search\n+ Constraint propagation]
        G5 --> G6[Simulated annealing\ntối ưu soft constraints]
        G6 --> G7[Generate Version #N]
        G7 --> G8[Score: conflict_count,\noptimization_score]
        G3 --> I5
    end

    subgraph REVIEW["👀 Review Phase"]
        R1[Display TKB grid\ntheo lớp / GV / phòng] --> R2{Có conflict?}
        R2 -->|Có| R3[Highlight conflicts\nmàu đỏ]
        R2 -->|Không| R5
        R3 --> R4[Manual adjust\ndrag & drop]
        R4 --> R1
        R1 --> R5[Review tổng thể\nvới Academic Director]
        R5 --> R6{Approve?}
        R6 -->|Cần sửa| R4
        R6 -->|Approve| PUB1
    end

    subgraph PUBLISH["📢 Publish Phase"]
        PUB1[Lock version\nstatus: APPROVED] --> PUB2[Export PDF per lớp]
        PUB2 --> PUB3[Publish to app\nGV/HS nhận TKB]
        PUB3 --> PUB4[Notify tất cả\nliên quan qua Zalo/Push]
        PUB4 --> PUB5[TKB active cho Semester]
    end

    subgraph ADJUST["🔄 In-Semester Adjustments"]
        A1[Sự kiện ngoài dự kiến\nGV nghỉ đột xuất] --> A2[Tạo adjustment request]
        A2 --> A3[Phê duyệt thay GV/hoán tiết]
        A3 --> A4[Cập nhật TKB\nthông báo liên quan]
    end

    INPUT --> GENERATE --> REVIEW --> PUBLISH --> ADJUST
```

---

## 4. Approval Workflow — Luồng Phê Duyệt

```mermaid
flowchart TD
    subgraph DRAFT["📝 Draft"]
        D1[Người dùng tạo request] --> D2[Điền form\nvà đính kèm]
        D2 --> D3[Preview & submit]
    end

    subgraph ROUTE["🔀 Routing"]
        R1{Loại approval?} --> R2["Nghỉ phép\n→ Direct Manager"]
        R1 --> R3["Chi phí > 5tr\n→ Principal + Org Owner"]
        R1 --> R4["Chính sách học phí\n→ Org Owner"]
        R1 --> R5["Tuyển dụng\n→ HR + Principal"]
    end

    subgraph REVIEW["👀 Review"]
        REV1[Approver nhận thông báo] --> REV2[Xem chi tiết request]
        REV2 --> REV3{Quyết định}
        REV3 -->|Approve| AP1
        REV3 -->|Reject + lý do| RJ1
        REV3 -->|Cần thêm info| RJ2[Yêu cầu bổ sung\ntrả về Draft]
    end

    subgraph MULTI_STEP["🔗 Multi-step (nếu cần)"]
        MS1[Step 1: Manager approve] --> MS2{Passed?}
        MS2 -->|Yes| MS3[Step 2: Director approve]
        MS2 -->|No| RJ1
        MS3 --> MS4{Passed?}
        MS4 -->|Yes| AP1
        MS4 -->|No| RJ1
    end

    subgraph COMPLETE["✅ Complete"]
        AP1[Status: APPROVED] --> AP2[Execute action\ntự động hoặc thủ công]
        AP2 --> AP3[Notify requester]
        AP3 --> AP4[Archive record]
    end

    subgraph REJECT["❌ Reject"]
        RJ1[Status: REJECTED] --> RJ3[Notify requester\nvới lý do]
        RJ2 --> DRAFT
    end

    DRAFT --> ROUTE --> REVIEW
    REVIEW --> MULTI_STEP
    MULTI_STEP --> COMPLETE
    REVIEW --> COMPLETE
    REVIEW --> REJECT
```

---

## 5. HRM Workflow — Từ Tuyển Dụng đến Lương

```mermaid
flowchart TD
    subgraph RECRUIT["🔍 Tuyển Dụng"]
        REC1[Xác định nhu cầu\nnhân sự] --> REC2[Tạo Job Posting]
        REC2 --> REC3[Publish: Website,\nFacebook, Vietnamworks]
        REC3 --> REC4[Thu hồ sơ ứng viên]
        REC4 --> REC5[HR sàng lọc hồ sơ]
        REC5 --> REC6[Phỏng vấn vòng 1\nHR + Technical]
        REC6 --> REC7{Passed?}
        REC7 -->|Không| REC8[Reject + notify]
        REC7 -->|Có| REC9[Phỏng vấn vòng 2\nPrincipal]
        REC9 --> REC10{Hired?}
        REC10 -->|Không| REC8
        REC10 -->|Có| ONB1
    end

    subgraph ONBOARD["🚀 Onboarding"]
        ONB1[Tạo Staff Profile\n+ User account] --> ONB2[Ký hợp đồng\nlưu Contract record]
        ONB2 --> ONB3[Setup phân quyền\nvà campus scope]
        ONB3 --> ONB4[Orientation\nvà bàn giao tài liệu]
        ONB4 --> ONB5[Assign lớp/bộ môn\n(nếu là GV)]
    end

    subgraph DAILY["📅 Vận Hành Hàng Ngày"]
        DY1[Chấm công hàng ngày\nApp/Fingerprint/Manual] --> DY2[Timesheet tự động\ncộng giờ làm]
        DY2 --> DY3{Nghỉ phép?}
        DY3 -->|Có| DY4[Submit Leave Request\n→ Approval flow]
        DY3 -->|Không| DY2
    end

    subgraph KPI_EVAL["📊 KPI & Đánh Giá"]
        KP1[Thiết lập KPI đầu kỳ] --> KP2[Track kết quả\nhàng tháng]
        KP2 --> KP3[Review KPI\ncuối kỳ]
        KP3 --> KP4[Đánh giá hiệu suất\n+ Điểm số]
        KP4 --> KP5{Grade}
        KP5 -->|Xuất sắc| KP6[Thưởng +\ntăng lương xem xét]
        KP5 -->|Không đạt| KP7[PIP - Cải thiện\nhoặc chấm dứt HĐ]
    end

    subgraph PAYROLL["💰 Lương"]
        PAY1[Cuối tháng:\nTổng hợp công] --> PAY2[Tính lương cơ bản\n+ Làm thêm giờ]
        PAY2 --> PAY3[Áp dụng phụ cấp\nvà khấu trừ]
        PAY3 --> PAY4[Tính thuế TNCN\nBHXH/BHYT]
        PAY4 --> PAY5[Generate payslip\ncho từng nhân viên]
        PAY5 --> PAY6[HR review\nvà approve]
        PAY6 --> PAY7[Chuyển khoản ngân hàng\nhoặc tiền mặt]
        PAY7 --> PAY8[Nhân viên nhận\nthông báo lương qua App]
    end

    RECRUIT --> ONBOARD --> DAILY --> KPI_EVAL --> PAYROLL
```

---

## 6. Student Enrollment Workflow — Nhập Học

```mermaid
flowchart TD
    ENR1[CRM: Lead converted\nEnrollment approved] --> ENR2[Tạo StudentProfile\n+ User account]
    ENR2 --> ENR3[Nhập thông tin\nphụ huynh/gia đình]
    ENR3 --> ENR4[Chọn ClassRoom\nphù hợp trình độ]
    ENR4 --> ENR5[StudentClassEnrollment\ncreated]
    ENR5 --> ENR6[Finance: Tạo Invoice\ntự động]
    ENR6 --> ENR7{Thanh toán?}
    ENR7 -->|Chưa| ENR8[Status: PENDING\nchờ thanh toán]
    ENR7 -->|Rồi| ENR9[Status: ACTIVE]
    ENR8 --> PAY[Payment flow]
    PAY --> ENR9
    ENR9 --> ENR10[Gửi Welcome\nEmail + Zalo]
    ENR10 --> ENR11[Student có thể\nlogin app]
    ENR11 --> ENR12[PH được link\nvào student account]
```

---

## 7. AI Decision Center — Alert Generation Workflow

```mermaid
flowchart TD
    DATA[Data Layer\nRaw events từ ERP/Finance/CRM] --> PROC[Event Processor\nReal-time streaming]
    PROC --> RULES[Rule Engine\nThreshold checks]
    PROC --> ML[ML Models\nPrediction engine]

    RULES --> R1{Alert triggered?}
    ML --> M1{Prediction confidence\n> threshold?}

    R1 -->|Có| ALERT
    M1 -->|Có| ALERT

    subgraph ALERT["🚨 Alert Generation"]
        AL1[Tạo Alert record] --> AL2[Classify priority\nCRITICAL/HIGH/MEDIUM/INFO]
        AL2 --> AL3[Identify recipients\ntheo role và scope]
        AL3 --> AL4[Generate recommendation\nbằng LLM]
    end

    ALERT --> DELIVER[Delivery Engine]
    DELIVER --> D1[In-app notification]
    DELIVER --> D2[Push notification\nMobile App]
    DELIVER --> D3[Zalo message\ncho Owner/Principal]
    DELIVER --> D4[Email digest\nhàng ngày]

    D1 & D2 & D3 & D4 --> ACTION{User Action}
    ACTION -->|Acknowledge| ACK[Mark as read]
    ACTION -->|Act on it| RESOLVE[Mark as resolved\nvới ghi chú]
    ACTION -->|Snooze| SNOOZE[Nhắc lại sau X giờ]

    style ALERT fill:#b71c1c,color:#fff
    style DELIVER fill:#e65100,color:#fff
```

---

*Document prepared by AvaB Architecture Team — 2026-07-04*
