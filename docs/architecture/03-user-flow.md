# AvaB V1.0 — User Flows

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft

---

## Tổng quan

Tài liệu này mô tả 5 user flow chính trong AvaB V1.0, bao gồm:
1. **Teacher Flow:** Tạo Course từ đầu với AI
2. **Admin Flow:** Quản lý học viên và học phí
3. **Student Flow:** Học và làm bài tập
4. **Parent Flow:** Xem tiến độ con
5. **AI Content Generation Flow:** Course → AI → Review → Publish

---

## Flow 1: Teacher — Tạo Course với AI

### Mô tả
Giáo viên sử dụng AI để tạo toàn bộ khóa học từ đầu, chỉnh sửa, và gửi duyệt.

### Happy Path Steps
1. Giáo viên đăng nhập và vào Course Studio
2. Tạo Project mới
3. Chọn Chương trình → Lớp → Môn học
4. Cấu hình thông tin khóa học (tên, mục tiêu, đối tượng)
5. Nhấn "Generate Full Course" → AI tạo cấu trúc
6. Review cấu trúc Chapter/Topic/Lesson
7. Chỉnh sửa từng Lesson trong Content Studio
8. Tạo/chỉnh sửa câu hỏi trong Question Bank
9. Gắn Assessment vào các Lesson
10. Gửi duyệt (Submit for Review)
11. Theo dõi trạng thái Approval

### Mermaid Flowchart

```mermaid
flowchart TD
    START(["👩‍🏫 Giáo viên đăng nhập"]) --> DASH["Dashboard\n/giao-vien"]
    DASH --> STUDIO["Vào Course Studio\n/admin/course-studio"]
    STUDIO --> NEW_PROJ["Tạo Project Mới\n+ New Project"]
    
    NEW_PROJ --> SELECT["Chọn cấu hình khóa học"]
    SELECT --> PROG["Chọn Chương trình\n(GDPT 2018 / Cambridge / IB)"]
    PROG --> GRADE["Chọn Lớp\n(Lớp 1-12)"]
    GRADE --> SUBJ["Chọn Môn học\n(Toán / Văn / Anh ...)"]
    SUBJ --> META["Nhập thông tin khóa học\n(Tên, mục tiêu, đối tượng, HK)"]
    
    META --> GEN_CHOICE{{"Tạo nội dung\nbằng AI?"}}
    GEN_CHOICE -->|"✅ Có"| AI_GEN["AI Generate Full Course\n→ Job Queue: Pending"]
    GEN_CHOICE -->|"❌ Tự làm"| MANUAL["Tạo thủ công\nChapter/Topic/Lesson"]
    
    AI_GEN --> QUEUE["Job Queue\nRunning..."]
    QUEUE --> AI_DONE{{"AI xong?"}}
    AI_DONE -->|"✅ Completed"| REVIEW_STRUCT["Review cấu trúc\nChapter/Topic/Lesson"]
    AI_DONE -->|"❌ Failed"| RETRY["Retry / Điều chỉnh prompt"]
    RETRY --> AI_GEN
    
    MANUAL --> REVIEW_STRUCT
    
    REVIEW_STRUCT --> EDIT_LESSON["Chỉnh sửa Lesson\ntrong Content Studio"]
    EDIT_LESSON --> ADD_MEDIA["Thêm Media\n(Video/Image/Audio)"]
    ADD_MEDIA --> CREATE_QS{{"Cần câu hỏi?"}}
    
    CREATE_QS -->|"✅ Có"| QB["Question Bank\nTạo / Generate Questions"]
    QB --> ATTACH_ASSESS["Gắn Assessment\nvào Lesson/Chapter"]
    CREATE_QS -->|"❌ Không cần"| ATTACH_ASSESS
    
    ATTACH_ASSESS --> PREVIEW["Xem trước Khóa học\n(Preview Mode)"]
    PREVIEW --> SATISFIED{{"Hài lòng?"}}
    SATISFIED -->|"❌ Sửa thêm"| EDIT_LESSON
    SATISFIED -->|"✅ OK"| SUBMIT["Submit for Review\n→ Trạng thái: Pending QA"]
    
    SUBMIT --> NOTIFY_ADMIN["Thông báo Admin/Publisher"]
    NOTIFY_ADMIN --> TRACK["Theo dõi Approval Status\nDashboard / Notifications"]
    TRACK --> APPROVED{{"Được duyệt?"}}
    APPROVED -->|"✅ Approved"| PUBLISHED["Course Published\n→ Có thể assign cho lớp"]
    APPROVED -->|"🔄 Cần sửa"| FEEDBACK["Nhận feedback\n→ Quay lại chỉnh sửa"]
    FEEDBACK --> EDIT_LESSON
    
    style START fill:#16A34A,color:#fff
    style PUBLISHED fill:#4F46E5,color:#fff
    style AI_GEN fill:#F59E0B,color:#fff
    style QUEUE fill:#F59E0B,color:#fff
```

---

## Flow 2: Admin — Quản lý Học viên và Học phí

### Mô tả
Admin trường quản lý toàn bộ vòng đời từ đăng ký → nhập học → thu học phí → theo dõi.

### Happy Path Steps
1. Admin nhận thông tin đăng ký từ học viên mới
2. Kiểm tra và duyệt đăng ký
3. Tạo Enrollment (nhập học)
4. Gán vào lớp học phù hợp
5. Tạo invoice học phí
6. Thu học phí (ghi nhận thanh toán)
7. Theo dõi học phí còn nợ
8. Tạo báo cáo tài chính

### Mermaid Flowchart

```mermaid
flowchart TD
    START(["⚙️ Admin đăng nhập"]) --> DASH["Admin Dashboard\n/admin"]
    
    subgraph REGISTRATION["📝 Quản lý Đăng ký"]
        DASH --> REG_LIST["Danh sách Đăng ký\n/admin/enrollments"]
        REG_LIST --> NEW_REG{{"Có đăng ký mới?"}}
        NEW_REG -->|"✅ Có"| REVIEW_REG["Review thông tin\nhọc viên"]
        REVIEW_REG --> VERIFY{{"Đủ điều kiện?"}}
        VERIFY -->|"✅ Đủ"| APPROVE_REG["Duyệt đăng ký\n→ Status: Approved"]
        VERIFY -->|"❌ Thiếu"| REQUEST_DOCS["Yêu cầu bổ sung\nhồ sơ"]
        REQUEST_DOCS --> REVIEW_REG
    end
    
    subgraph ENROLLMENT["🎓 Nhập học"]
        APPROVE_REG --> CREATE_USER["Tạo tài khoản\nhọc viên"]
        CREATE_USER --> ASSIGN_CLASS["Gán vào lớp học\nClass Management"]
        ASSIGN_CLASS --> LINK_PARENT{{"Có phụ huynh?"}}
        LINK_PARENT -->|"✅ Có"| LINK["Liên kết\nParent-Student"]
        LINK_PARENT -->|"❌ Không"| ENROLLED
        LINK --> ENROLLED(["✅ Học viên đã nhập học"])
    end
    
    subgraph FINANCE["💰 Quản lý Học phí"]
        ENROLLED --> GEN_INVOICE["Tạo hóa đơn\nhọc phí"]
        GEN_INVOICE --> NOTIFY_PAY["Thông báo phụ huynh\n→ Email / App"]
        NOTIFY_PAY --> DUE_DATE{{"Đến hạn\nthanh toán?"}}
        DUE_DATE -->|"✅ Đã thanh toán"| RECORD_PAY["Ghi nhận thanh toán\nTuitionPayment"]
        DUE_DATE -->|"❌ Chưa"| REMIND["Gửi nhắc nhở\nthanhtoán"]
        REMIND --> DUE_DATE
        RECORD_PAY --> UPDATE_STATUS["Cập nhật trạng thái\n→ Paid"]
    end
    
    subgraph MONITORING["📊 Theo dõi & Báo cáo"]
        UPDATE_STATUS --> TRACK_DEBT["Kiểm tra học phí\ncòn nợ"]
        TRACK_DEBT --> MONTHLY_REPORT["Báo cáo tháng\n/admin/analytics/finance"]
        MONTHLY_REPORT --> EXPORT["Xuất Excel/PDF\n→ Gửi ban giám đốc"]
    end
    
    style START fill:#DC2626,color:#fff
    style ENROLLED fill:#16A34A,color:#fff
    style EXPORT fill:#4F46E5,color:#fff
```

---

## Flow 3: Student — Học và Làm bài tập

### Mô tả
Học viên đăng nhập, tiếp tục học bài, làm bài tập và kiểm tra tiến độ.

### Happy Path Steps
1. Học viên đăng nhập
2. Xem Dashboard (tiến độ, bài tập cần làm)
3. Chọn khóa học để tiếp tục
4. Học bài (đọc, xem video, tương tác)
5. Làm bài tập cuối bài
6. Nhận kết quả và XP
7. Xem tiến độ tổng thể
8. Hỏi AI Tutor khi không hiểu

### Mermaid Flowchart

```mermaid
flowchart TD
    START(["👨‍🎓 Học viên đăng nhập"]) --> DASH["Student Dashboard\n/hoc-vien"]
    
    DASH --> CHECK_TODO{{"Có bài tập\nquá hạn?"}}
    CHECK_TODO -->|"⚠️ Có"| ALERT["Cảnh báo: Bài tập\ncần nộp gấp"]
    ALERT --> DO_HW
    CHECK_TODO -->|"✅ Không"| CONTINUE["Tiếp tục học\nkhóa học đang dở"]
    
    CONTINUE --> COURSE["Trang Khóa học\n/hoc-vien/khoa-hoc/[id]"]
    COURSE --> LESSON["Mở Bài học\n/hoc-vien/khoa-hoc/[id]/bai-hoc/[lessonId]"]
    
    subgraph LEARNING["📖 Quá trình học"]
        LESSON --> READ["Đọc nội dung\nLý thuyết + Ví dụ"]
        READ --> WATCH{{"Có video?"}}
        WATCH -->|"✅ Có"| VIDEO["Xem video\nbài giảng"]
        WATCH -->|"❌ Không"| INTERACT
        VIDEO --> INTERACT["Tương tác\nDrag & Drop / Interactive"]
        INTERACT --> MINI_QUIZ{{"Có câu hỏi\nthực hành?"}}
        MINI_QUIZ -->|"✅ Có"| PRACTICE["Làm câu hỏi\nthực hành"]
        PRACTICE --> CHECK_ANS{{"Đúng?"}}
        CHECK_ANS -->|"✅"| NEXT_ACT["Tiếp tục\nhoạt động"]
        CHECK_ANS -->|"❌"| HINT["Xem gợi ý\n→ Thử lại"]
        HINT --> PRACTICE
        MINI_QUIZ -->|"❌ Không"| NEXT_ACT
        NEXT_ACT --> LESSON_DONE{{"Hết bài?"}}
        LESSON_DONE -->|"❌"| READ
    end
    
    LESSON_DONE -->|"✅"| LESSON_COMPLETE["Bài học hoàn thành\n+XP Points"]
    LESSON_COMPLETE --> DO_HW{{"Có bài tập\nkhóa học?"}}
    DO_HW -->|"✅ Có"| HW["Làm bài tập\n/hoc-vien/bai-tap/[id]"]
    DO_HW -->|"❌ Không"| NEXT_LESSON
    
    HW --> SUBMIT_HW["Nộp bài tập"]
    SUBMIT_HW --> RESULT["Xem kết quả\n+ Giải thích"]
    RESULT --> CONFUSED{{"Không hiểu\nbài?"}}
    CONFUSED -->|"✅ Có"| AI_TUTOR["Hỏi AI Tutor\n/hoc-vien/ai-tutor"]
    AI_TUTOR --> EXPLAINED["AI giải thích\n→ Hiểu hơn"]
    CONFUSED -->|"❌ Không"| NEXT_LESSON
    EXPLAINED --> NEXT_LESSON
    
    NEXT_LESSON --> PROGRESS["Xem tiến độ\n/hoc-vien/tien-do"]
    PROGRESS --> BADGE{{"Đạt badge\nmới?"}}
    BADGE -->|"✅ Có"| CELEBRATE["🎉 Nhận Badge!\nThành tích mới"]
    BADGE -->|"❌ Không"| DONE
    CELEBRATE --> DONE(["✅ Phiên học hoàn thành"])
    
    style START fill:#16A34A,color:#fff
    style DONE fill:#4F46E5,color:#fff
    style AI_TUTOR fill:#F59E0B,color:#fff
    style CELEBRATE fill:#EC4899,color:#fff
```

---

## Flow 4: Parent — Xem Tiến độ Con

### Mô tả
Phụ huynh đăng nhập để theo dõi tiến độ học tập, học phí và liên lạc với giáo viên.

### Happy Path Steps
1. Phụ huynh đăng nhập
2. Xem dashboard tổng hợp về con
3. Kiểm tra tiến độ học từng môn
4. Xem bài tập chưa làm
5. Kiểm tra học phí
6. Xem thông báo từ giáo viên/trường

### Mermaid Flowchart

```mermaid
flowchart TD
    START(["👨‍👩‍👧 Phụ huynh đăng nhập"]) --> DASH["Parent Dashboard\n/phu-huynh"]
    
    DASH --> UNREAD{{"Có thông báo\nmới?"}}
    UNREAD -->|"✅ Có"| NOTIF["Đọc thông báo\ntừ giáo viên/trường"]
    NOTIF --> NOTIF_TYPE{{"Loại thông báo?"}}
    NOTIF_TYPE -->|"📋 Bài tập"| CHECK_HW
    NOTIF_TYPE -->|"💰 Học phí"| CHECK_FEE
    NOTIF_TYPE -->|"📢 Thông báo chung"| READ_ANN["Đọc thông báo\n→ OK"]
    UNREAD -->|"❌ Không"| CHILDREN
    
    CHILDREN["Xem danh sách con\n/phu-huynh/con"] --> SELECT_CHILD["Chọn con\ncần xem"]
    
    subgraph PROGRESS["📊 Tiến độ học tập"]
        SELECT_CHILD --> VIEW_PROGRESS["Tiến độ học tập\n/phu-huynh/con/[id]/tien-do"]
        VIEW_PROGRESS --> COURSE_PROG["Tiến độ theo\nTừng khóa học"]
        COURSE_PROG --> SCORE_VIEW["Xem điểm số\nBài kiểm tra gần nhất"]
        SCORE_VIEW --> ATTEND["Xem điểm danh\nHọc viên có đi học?"]
    end
    
    subgraph HOMEWORK["📝 Bài tập"]
        CHECK_HW["Kiểm tra bài tập\ncủa con"] --> HW_STATUS{{"Bài tập\ncó được nộp?"}}
        HW_STATUS -->|"✅ Đã nộp"| VIEW_GRADE["Xem điểm\n+ Nhận xét GV"]
        HW_STATUS -->|"⏰ Chưa nộp"| REMIND_CHILD["Nhắc con\nlàm bài"]
        HW_STATUS -->|"❌ Quá hạn"| CONTACT_TEACHER
    end
    
    subgraph FINANCE["💰 Học phí"]
        CHECK_FEE["Xem học phí\n/phu-huynh/hoc-phi"] --> FEE_STATUS{{"Trạng thái\nhọc phí?"}}
        FEE_STATUS -->|"✅ Đã đóng"| FEE_OK["OK - Xem\nlịch sử thanh toán"]
        FEE_STATUS -->|"⏰ Sắp đến hạn"| PAY["Thanh toán online\n→ VNPay / Momo"]
        FEE_STATUS -->|"❌ Quá hạn"| URGENT_PAY["Thanh toán gấp\n→ Thông báo khẩn"]
        PAY --> PAY_DONE["✅ Thanh toán\nthành công"]
        URGENT_PAY --> PAY_DONE
    end
    
    ATTEND --> CONTACT_TEACHER{{"Cần liên hệ\ngiáo viên?"}}
    VIEW_GRADE --> CONTACT_TEACHER
    CONTACT_TEACHER -->|"✅ Có"| MESSAGE["Gửi tin nhắn\ncho giáo viên"]
    CONTACT_TEACHER -->|"❌ Không"| DONE
    MESSAGE --> DONE
    FEE_OK --> DONE
    PAY_DONE --> DONE
    READ_ANN --> DONE
    
    DONE(["✅ Hoàn thành\nkiểm tra"])
    
    style START fill:#9333EA,color:#fff
    style DONE fill:#4F46E5,color:#fff
    style PAY fill:#F59E0B,color:#fff
    style URGENT_PAY fill:#DC2626,color:#fff
```

---

## Flow 5: AI Content Generation — Course → AI → Review → Publish

### Mô tả
Quy trình đầy đủ từ khi khởi tạo course đến khi xuất bản, bao gồm Job Queue và Approval Workflow.

### Approval States
```
Draft → Generate → QA → Teacher Review → Approved → Published → Archived
```

### Mermaid Flowchart

```mermaid
flowchart TD
    START(["🚀 Bắt đầu\nContent Generation"]) --> INIT["Tạo AI Project\n/admin/ai-studio"]
    
    subgraph CONFIG["⚙️ Cấu hình"]
        INIT --> SET_PROGRAM["Chọn Chương trình\n+ Lớp + Môn"]
        SET_PROGRAM --> SET_SCOPE["Chọn phạm vi\n(Full Course / Chapter / Lesson)"]
        SET_SCOPE --> CONFIGURE["Cấu hình tham số\n(Trình độ, Phong cách, Ngôn ngữ)"]
        CONFIGURE --> SET_TEMPLATE["Chọn Template\n(Word/Slide/PDF)"]
    end
    
    subgraph GENERATION["🤖 AI Generation"]
        SET_TEMPLATE --> SUBMIT_JOB["Submit Job\n→ Status: Pending"]
        SUBMIT_JOB --> QUEUE["Job Queue\nRunning..."]
        QUEUE --> ENGINES["AI Engines Pipeline"]
        
        ENGINES --> E1["1. Education Standard Engine\nPhân tích chuẩn chương trình"]
        E1 --> E2["2. Curriculum Generator\nTạo cấu trúc Course"]
        E2 --> E3["3. Lesson Generator\nTạo nội dung từng bài"]
        E3 --> E4["4. Homework Generator\nTạo bài tập"]
        E4 --> E5["5. Knowledge Graph\nLiên kết kiến thức"]
        
        E5 --> JOB_STATUS{{"Job Status?"}}
        JOB_STATUS -->|"✅ Completed"| CONTENT_READY["Nội dung đã tạo\n→ Status: Generated"]
        JOB_STATUS -->|"❌ Failed"| FAILED["Job Failed\n→ Xem error log"]
        FAILED --> RETRY{{"Có thể\nRetry?"}}
        RETRY -->|"✅"| QUEUE
        RETRY -->|"❌"| MANUAL_FIX["Điều chỉnh cấu hình\n→ Submit lại"]
        MANUAL_FIX --> SUBMIT_JOB
    end
    
    subgraph QA_FLOW["🔍 QA Process"]
        CONTENT_READY --> AUTO_QA["QA Engine\nKiểm tra tự động"]
        AUTO_QA --> QA_CHECKS["Kiểm tra:\n- Chính tả\n- Chuẩn kiến thức\n- Format\n- Độ dài"]
        QA_CHECKS --> QA_RESULT{{"QA Pass?"}}
        QA_RESULT -->|"✅ Pass"| TEACHER_REVIEW["Gửi giáo viên\nreview thủ công"]
        QA_RESULT -->|"❌ Fail"| QA_REPORT["Báo cáo lỗi QA\n+ Gợi ý sửa"]
        QA_REPORT --> AUTO_FIX{{"Auto-fix\nkhả dụng?"}}
        AUTO_FIX -->|"✅"| FIX_AND_RETRY["AI tự sửa\n→ Re-QA"]
        FIX_AND_RETRY --> AUTO_QA
        AUTO_FIX -->|"❌"| HUMAN_FIX["Người soạn\nsửa thủ công"]
        HUMAN_FIX --> AUTO_QA
    end
    
    subgraph REVIEW["👩‍🏫 Teacher Review"]
        TEACHER_REVIEW --> REVIEW_CONTENT["Giáo viên review\nnội dung"]
        REVIEW_CONTENT --> TEACHER_DECISION{{"Quyết định?"}}
        TEACHER_DECISION -->|"✅ Approve"| APPROVED["Status: Approved\n→ Gửi Admin duyệt"]
        TEACHER_DECISION -->|"🔄 Request Changes"| CHANGES["Ghi nhận feedback\n→ Sửa lại"]
        CHANGES --> HUMAN_FIX
    end
    
    subgraph PUBLISH["📡 Publishing"]
        APPROVED --> ADMIN_APPROVE{{"Admin duyệt?"}}
        ADMIN_APPROVE -->|"✅ Duyệt"| PUBLISHING_ENGINE["Publishing Engine\nChuẩn bị xuất bản"]
        ADMIN_APPROVE -->|"❌ Từ chối"| REJECT_REASON["Ghi lý do từ chối\n→ Trả về sửa"]
        REJECT_REASON --> HUMAN_FIX
        
        PUBLISHING_ENGINE --> EXPORT_FORMATS["Xuất đa định dạng\nPDF / Word / SCORM"]
        EXPORT_FORMATS --> ASSIGN{{"Phân phối?"}}
        ASSIGN -->|"Assign lớp"| CLASS_ASSIGN["Gán vào lớp học\nClass Management"]
        ASSIGN -->|"Public Library"| PUBLIC_LIB["Course Library\nCông khai"]
        ASSIGN -->|"Share trường"| SCHOOL_SHARE["Chia sẻ\nnội bộ trường"]
        
        CLASS_ASSIGN --> PUBLISHED(["✅ PUBLISHED\nHọc viên có thể học"])
        PUBLIC_LIB --> PUBLISHED
        SCHOOL_SHARE --> PUBLISHED
    end
    
    PUBLISHED --> MONITOR["Analytics Center\nTheo dõi hiệu quả"]
    MONITOR --> UPDATE{{"Cần cập nhật?"}}
    UPDATE -->|"✅"| NEW_VERSION["Tạo phiên bản mới\nContent Version"]
    NEW_VERSION --> INIT
    UPDATE -->|"❌"| ARCHIVE{{"Retire?"}}
    ARCHIVE -->|"✅"| ARCHIVED(["📦 Archived"])
    ARCHIVE -->|"❌"| MONITOR
    
    style START fill:#4F46E5,color:#fff
    style PUBLISHED fill:#16A34A,color:#fff
    style ARCHIVED fill:#6B7280,color:#fff
    style AUTO_QA fill:#F59E0B,color:#fff
    style ENGINES fill:#F59E0B,color:#fff
```

---

## Phụ lục: Flow Tóm tắt

| Flow | Actor | Start | End | Thời gian ước tính |
|------|-------|-------|-----|---------------------|
| Teacher tạo Course | Teacher | Login | Course Published | 2-4 giờ |
| Admin quản lý HV | Admin | Nhận đăng ký | Báo cáo tài chính | Liên tục |
| Student học bài | Student | Login | Hoàn thành phiên | 30-60 phút |
| Parent theo dõi | Parent | Login | Kiểm tra xong | 5-10 phút |
| AI Generation | Teacher/Admin | Configure | Published | 30-120 phút |

---

## Edge Cases & Error States

### Flow 1 (Teacher)
- AI generation timeout → Hiển thị retry button + email notification
- AI content quality thấp → QA Engine flag + suggest manual edit
- Permission denied → Redirect to login

### Flow 2 (Admin)
- Duplicate student → Warning + merge option
- Payment failure → Retry với cách khác
- Class full → Waitlist option

### Flow 3 (Student)
- Network offline → Cache bài học cho offline
- Video không load → Text fallback
- Hết session → Auto-save progress

### Flow 4 (Parent)
- Không có con nào → Onboarding để link con
- Thanh toán fail → Alternative payment methods

### Flow 5 (AI Generation)
- Token limit exceeded → Chia nhỏ generation job
- API rate limit → Queue với backoff
- Nội dung không phù hợp → Flag + human review

---

*Flows này cần được validate với prototype/usability testing trước khi development.*
