# AvaB V1.0 — Information Architecture

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft

---

## 1. Tổng quan hệ thống

AvaB là AI Education Platform phục vụ K12 (Lớp 1–12), có khả năng mở rộng sang Mầm non, Đại học, SAT, IELTS, Cambridge, IB. Hệ thống tổ chức xung quanh 3 trục chính:

- **Content Axis:** Phân cấp nội dung học tập từ Program → Lesson
- **User Axis:** Phân cấp người dùng theo role và tổ chức (School)
- **AI Axis:** AI Engines hỗ trợ toàn bộ vòng đời nội dung

---

## 2. Phân cấp nội dung (Content Hierarchy)

```
Program (Chương trình học tổng thể)
├── Grade (Lớp: 1–12 + Mầm non + Đại học)
│   └── Subject (Môn học: Toán, Văn, Anh, Lý, Hóa, ...)
│       └── Course (Khóa học: Toán lớp 5 HK1)
│           ├── Chapter (Chương: Chương 1 - Số tự nhiên)
│           │   └── Topic (Chủ đề: Phép cộng, Phép trừ)
│           │       └── Lesson (Bài học: Bài 3 - Cộng hai số có 3 chữ số)
│           │           ├── Activity (Hoạt động: Đọc, Xem video, Thực hành)
│           │           │   └── Question (Câu hỏi: MCQ, Fill-in, Essay)
│           │           └── Assessment (Bài kiểm tra cuối bài/chương/kỳ)
│           └── HomeworkSet (Bộ bài tập về nhà)
```

### 2.1 Định nghĩa từng cấp

| Cấp | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
| L1 | Program | Chương trình giáo dục quốc gia hoặc quốc tế | GDPT 2018, Cambridge, IB, SAT |
| L2 | Grade | Lớp học theo chương trình | Lớp 1, Lớp 12, Grade 10 |
| L3 | Subject | Môn học trong lớp | Toán, Văn, Tiếng Anh, KHTN |
| L4 | Course | Khóa học cụ thể (thường = 1 học kỳ) | Toán 5 HK1, English 7 Term 2 |
| L5 | Chapter | Chương/phần trong khóa | Chương 1: Số và Phép tính |
| L6 | Topic | Chủ đề/bài lớn | Phép cộng số tự nhiên |
| L7 | Lesson | Bài học đơn lẻ (30–45 phút) | Bài 3: Cộng hai số có 3 chữ số |
| L8 | Activity | Hoạt động trong bài | Video giới thiệu, Bài tập thực hành |
| L9 | Question | Câu hỏi trong activity/bài kiểm tra | MCQ, Fill-in, Essay, Matching |
| L10 | Assessment | Bài kiểm tra đánh giá | Quiz 15', Kiểm tra 1 tiết, Thi HK |

---

## 3. Phân cấp tổ chức (Organization Hierarchy)

```
Platform (AvaB)
├── School (Trường / Trung tâm)
│   ├── Admin (Quản trị viên trường)
│   ├── Teacher (Giáo viên)
│   │   └── Class (Lớp học)
│   │       ├── Enrollment (Học viên đã đăng ký)
│   │       └── Schedule (Lịch học)
│   ├── Student (Học viên)
│   │   └── LearnerProfile (Hồ sơ học tập)
│   └── Parent (Phụ huynh)
│       └── ParentStudentLink (Liên kết PH–HV)
└── Super Admin (Quản trị viên Platform)
```

---

## 4. Workspace Architecture

### 4.1 Tổng quan các Workspace

Hệ thống gồm **16 Workspace chính**, chia thành 5 nhóm:

```
AvaB Platform
├── 🏠 Core Workspaces
│   ├── Dashboard (Trang tổng quan)
│   └── Notification Center (Trung tâm thông báo)
│
├── 📚 Content Workspaces
│   ├── Course Studio (Tạo & chỉnh sửa khóa học)
│   ├── Course Library (Thư viện khóa học)
│   ├── Content Studio (Tạo nội dung bài giảng)
│   ├── Question Bank (Ngân hàng câu hỏi)
│   └── Asset Library (Thư viện tài nguyên)
│
├── 🤖 AI Workspaces
│   ├── AI Studio (Điều khiển các AI Engine)
│   └── Publishing Center (Xuất bản & phân phối)
│
├── 👥 User Workspaces
│   ├── Teacher Center (Không gian giáo viên)
│   ├── Student Center (Không gian học viên)
│   ├── Parent Center (Không gian phụ huynh)
│   └── Class Management (Quản lý lớp học)
│
└── ⚙️ Management Workspaces
    ├── Analytics Center (Phân tích & báo cáo)
    └── Settings (Cài đặt hệ thống)
```

### 4.2 Chi tiết từng Workspace

#### 🏠 Dashboard
```
Dashboard
├── Overview Cards (Thống kê nhanh)
│   ├── Tổng học viên
│   ├── Khóa học đang hoạt động
│   ├── Bài học hôm nay
│   └── Doanh thu (nếu có)
├── Recent Activity (Hoạt động gần đây)
├── Upcoming Events (Sự kiện sắp tới)
├── AI Job Status (Trạng thái công việc AI)
└── Quick Actions (Thao tác nhanh)
```

#### 📚 Course Studio
```
Course Studio
├── My Projects (Dự án của tôi)
│   ├── Active Projects (Đang làm)
│   ├── Draft Projects (Bản nháp)
│   └── Archived Projects (Đã lưu trữ)
├── Project Detail
│   ├── Course Structure (Cây nội dung)
│   ├── Chapter Editor
│   ├── Lesson Editor
│   ├── Activity Builder
│   └── Assessment Builder
├── AI Generation Panel
│   ├── Generate Full Course
│   ├── Generate Chapter
│   ├── Generate Lesson
│   └── Job Queue Status
└── Review & QA Panel
    ├── Content Review
    ├── QA Checklist
    └── Approval Workflow
```

#### 📖 Course Library
```
Course Library
├── Browse (Duyệt khóa học)
│   ├── By Program
│   ├── By Grade
│   ├── By Subject
│   └── By Status
├── Search & Filter
├── Course Preview
├── Enrollment Management
└── Publishing Status
```

#### ✏️ Content Studio
```
Content Studio
├── Lesson Editor
│   ├── Rich Text Editor
│   ├── Media Embed (Video/Audio/Image)
│   ├── Interactive Elements
│   └── Preview Mode
├── Template Gallery
│   ├── Lesson Templates
│   ├── Slide Templates
│   └── Worksheet Templates
├── Asset Integration
└── Export Options (PDF/Word/PPTX)
```

#### 🤖 AI Studio
```
AI Studio
├── AI Engines
│   ├── Education Standard Engine
│   ├── Curriculum Generator
│   ├── Lesson Generator
│   ├── Homework Generator
│   ├── QA Engine
│   ├── Publishing Engine
│   ├── Knowledge Graph
│   └── AI Tutor
├── Job Queue
│   ├── Pending Jobs
│   ├── Running Jobs
│   ├── Completed Jobs
│   ├── Failed Jobs
│   └── Retry Jobs
├── AI Configuration
│   ├── Model Settings
│   ├── Prompt Templates
│   └── Generation Parameters
└── AI Analytics
    ├── Generation Stats
    ├── Quality Metrics
    └── Cost Tracking
```

#### 🏦 Question Bank
```
Question Bank
├── Browse Questions
│   ├── By Subject
│   ├── By Grade
│   ├── By Type (MCQ/Fill/Essay)
│   ├── By Difficulty
│   └── By Tag/Skill
├── Question Editor
│   ├── MCQ Builder
│   ├── Fill-in-blank Builder
│   ├── Essay Builder
│   ├── Matching Builder
│   └── True/False Builder
├── AI Question Generator
├── Import/Export (Excel/CSV)
└── Question Analytics
```

#### 🖼️ Asset Library
```
Asset Library
├── Images
│   ├── Educational Illustrations
│   ├── Diagrams
│   └── Photos
├── Videos
│   ├── Lecture Videos
│   └── Animation
├── Audio
│   ├── Pronunciations
│   └── Music
├── Documents
│   ├── Reference Materials
│   └── Worksheets
├── Upload Manager
└── AI Image Generator
```

#### 👩‍🏫 Teacher Center
```
Teacher Center
├── My Classes (Lớp của tôi)
│   ├── Class Overview
│   ├── Student List
│   ├── Attendance
│   └── Class Schedule
├── Teaching Materials
│   ├── My Courses
│   ├── Shared Resources
│   └── Lesson Plans
├── Assignments
│   ├── Create Assignment
│   ├── Active Assignments
│   └── Grading Queue
├── Student Progress
│   ├── Individual Progress
│   ├── Class Progress
│   └── Learning Analytics
└── Communication
    ├── Announcements
    └── Messages
```

#### 👨‍🎓 Student Center
```
Student Center
├── My Learning (Học của tôi)
│   ├── Current Courses
│   ├── Continue Learning
│   └── Completed Courses
├── Assignments (Bài tập)
│   ├── Due Today
│   ├── Upcoming
│   └── Submitted
├── Progress & Stats
│   ├── Learning Streak
│   ├── XP & Badges
│   └── Subject Progress
├── AI Tutor
│   ├── Ask Question
│   └── Study Recommendations
└── Schedule (Lịch học)
```

#### 👨‍👩‍👧 Parent Center
```
Parent Center
├── My Children (Con của tôi)
│   ├── Learning Progress
│   ├── Assignment Status
│   └── Attendance
├── Communication
│   ├── Messages from Teacher
│   └── School Announcements
├── Finance
│   ├── Tuition Status
│   └── Payment History
└── Reports
    ├── Weekly Report
    └── Term Report
```

#### 🏫 Class Management
```
Class Management
├── Classes (Lớp học)
│   ├── Class List
│   ├── Create Class
│   └── Class Schedule
├── Enrollment
│   ├── Enrollments List
│   ├── Add Student
│   ├── Transfer Student
│   └── Drop Student
├── Attendance
│   ├── Daily Attendance
│   └── Attendance Reports
└── Finance Management
    ├── Tuition Collection
    ├── Payment Tracking
    └── Financial Reports
```

#### 📊 Analytics Center
```
Analytics Center
├── Overview Dashboard
├── Learning Analytics
│   ├── Completion Rate
│   ├── Average Score
│   └── Time on Task
├── Student Analytics
│   ├── Individual Reports
│   └── Cohort Analysis
├── Content Analytics
│   ├── Course Performance
│   ├── Question Difficulty
│   └── Content Gaps
├── Financial Analytics
│   ├── Revenue Reports
│   └── Collection Rate
└── AI Analytics
    ├── Generation Volume
    └── Quality Scores
```

#### 📡 Publishing Center
```
Publishing Center
├── Approval Queue
│   ├── Pending Review
│   ├── In Review
│   └── Approved
├── Published Content
│   ├── Published Courses
│   └── Published Questions
├── Distribution
│   ├── Assign to Classes
│   └── Share with Schools
└── Version Management
    ├── Content Versions
    └── Rollback Options
```

---

## 5. Mapping Workspace — Role

| Workspace | Super Admin | School Admin | Teacher | Student | Parent |
|-----------|:-----------:|:------------:|:-------:|:-------:|:------:|
| Dashboard | ✅ Full | ✅ School | ✅ Own | ✅ Own | ✅ Own |
| Course Studio | ✅ | ✅ | ✅ | ❌ | ❌ |
| Course Library | ✅ | ✅ | ✅ Read | ✅ Read | ❌ |
| Content Studio | ✅ | ✅ | ✅ | ❌ | ❌ |
| AI Studio | ✅ Full | ✅ Limited | ✅ Limited | ❌ | ❌ |
| Question Bank | ✅ | ✅ | ✅ | ❌ | ❌ |
| Asset Library | ✅ | ✅ | ✅ | ✅ Read | ❌ |
| Teacher Center | ✅ View | ✅ View | ✅ Own | ❌ | ❌ |
| Student Center | ✅ View | ✅ View | ✅ View | ✅ Own | ❌ |
| Parent Center | ✅ View | ✅ View | ❌ | ❌ | ✅ Own |
| Class Management | ✅ | ✅ | ✅ Limited | ❌ | ❌ |
| Analytics Center | ✅ Full | ✅ School | ✅ Class | ✅ Own | ✅ Child |
| Publishing Center | ✅ | ✅ | ✅ Submit | ❌ | ❌ |
| Notification Center | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ Full | ✅ School | ✅ Profile | ✅ Profile | ✅ Profile |

---

## 6. Information Flow

### 6.1 Content Creation Flow
```
AI Studio (Generate) 
  → Course Studio (Edit & Review) 
    → Publishing Center (QA & Approve) 
      → Course Library (Published)
        → Class Management (Assign)
          → Student Center (Learn)
            → Analytics Center (Track)
```

### 6.2 Assessment Flow
```
Question Bank (Create/Generate)
  → Assessment Builder (Assemble)
    → Course Studio (Attach to Lesson)
      → Student Center (Take Assessment)
        → Analytics Center (Results)
          → Teacher Center (Review & Grade)
```

### 6.3 Tuition Flow
```
Enrollment (Register)
  → Class Management (Confirm)
    → Finance (Generate Invoice)
      → Parent Center (View & Pay)
        → Analytics Center (Track)
```

---

## 7. Navigation Structure

### 7.1 Primary Navigation (Sidebar)

```
[AvaB Logo]
├── 🏠 Dashboard
├── 📚 Nội dung
│   ├── Course Studio
│   ├── Course Library
│   ├── Content Studio
│   ├── Question Bank
│   └── Asset Library
├── 🤖 AI
│   ├── AI Studio
│   └── Publishing Center
├── 👥 Người dùng
│   ├── Teacher Center
│   ├── Student Center
│   ├── Parent Center
│   └── Class Management
├── 📊 Phân tích
│   └── Analytics Center
└── ⚙️ Cài đặt
    └── Settings
```

### 7.2 Context-aware Navigation

Mỗi role sẽ thấy navigation được tùy chỉnh:

- **Super Admin:** Toàn bộ sidebar
- **School Admin:** Ẩn Platform-level settings, thấy School management
- **Teacher:** Course Studio, Teacher Center, Question Bank, Asset Library
- **Student:** Student Center, My Courses, Schedule
- **Parent:** Parent Center, My Children, Finance

---

## 8. Search & Discovery Architecture

```
Global Search
├── Semantic Search (AI-powered)
├── Filter Facets
│   ├── Content Type (Course/Lesson/Question)
│   ├── Grade Level
│   ├── Subject
│   ├── Difficulty
│   └── Status
├── Recent Searches
└── Suggested Content (Personalized)
```

---

## 9. Content States & Lifecycle

```
Draft → [AI Generate] → Generating → Generated
     → [Human Edit]  → Review
                     → [QA Engine] → QA Pass → Teacher Review
                                              → Approved → Published
                                   → QA Fail → Revision
Published → [Update] → New Version Draft
          → [Archive] → Archived
```

---

*Tài liệu này là nền tảng cho thiết kế UX/UI và phát triển tính năng AvaB V1.0. Cập nhật khi có thay đổi spec.*
