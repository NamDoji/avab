# AvaB EOS v2.0 — Database ERD (Entity Relationship Diagram)

> **Date:** 2026-07-04  
> **Version:** 2.0  
> **Status:** Architecture Planning

---

## 1. Ghi Chú Thiết Kế

- **Database:** PostgreSQL với Prisma ORM
- **Multi-tenancy:** Row-level tenancy (orgId trên mọi bảng)
- **Soft delete:** `deletedAt` timestamp thay vì DELETE thực
- **Audit:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy` trên mọi bảng
- **Tránh reserved words:** `ClassRoom` thay vì `Class`

---

## 2. ERD — Core Organization

```mermaid
erDiagram
    Organization {
        string id PK
        string name
        string slug UK
        string logo
        string domain
        json settings
        string planTier
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Campus {
        string id PK
        string orgId FK
        string name
        string address
        string city
        string phone
        string principalId FK
        json settings
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Department {
        string id PK
        string campusId FK
        string orgId FK
        string name
        string headId FK
        string description
        datetime createdAt
        datetime updatedAt
    }

    AcademicYear {
        string id PK
        string orgId FK
        string name
        date startDate
        date endDate
        boolean isCurrent
        datetime createdAt
    }

    Semester {
        string id PK
        string academicYearId FK
        string name
        date startDate
        date endDate
        int semesterNumber
        boolean isCurrent
    }

    Grade {
        string id PK
        string orgId FK
        int level
        string name
        string description
    }

    ClassRoom {
        string id PK
        string campusId FK
        string orgId FK
        string semesterId FK
        string gradeId FK
        string name
        int maxCapacity
        string homeTeacherId FK
        boolean isActive
        datetime createdAt
    }

    Room {
        string id PK
        string campusId FK
        string name
        int capacity
        string type
        json equipment
        boolean isAvailable
    }

    Organization ||--o{ Campus : "has"
    Organization ||--o{ AcademicYear : "has"
    Organization ||--o{ Grade : "has"
    Campus ||--o{ Department : "has"
    Campus ||--o{ ClassRoom : "has"
    Campus ||--o{ Room : "has"
    AcademicYear ||--o{ Semester : "has"
    Semester ||--o{ ClassRoom : "groups"
    Grade ||--o{ ClassRoom : "categorizes"
```

---

## 3. ERD — School ERP

```mermaid
erDiagram
    StudentProfile {
        string id PK
        string userId FK
        string orgId FK
        string currentCampusId FK
        string currentClassId FK
        string studentCode UK
        string parentName
        string parentPhone
        string parentEmail
        string relationship
        string address
        date dateOfBirth
        string gender
        date enrollmentDate
        string status
        datetime createdAt
        datetime updatedAt
    }

    TeacherProfile {
        string id PK
        string userId FK
        string orgId FK
        string primaryCampusId FK
        string departmentId FK
        string specialization
        json certifications
        json campusIds
        string employeeCode UK
        date hireDate
        string status
        datetime createdAt
    }

    StudentClassEnrollment {
        string id PK
        string studentId FK
        string classRoomId FK
        date enrolledAt
        date leftAt
        string status
    }

    Attendance {
        string id PK
        string classRoomId FK
        string studentId FK
        string markedBy FK
        date attendanceDate
        int period
        string status
        string note
        datetime markedAt
    }

    RewardDiscipline {
        string id PK
        string studentId FK
        string campusId FK
        string issuedBy FK
        string type
        string category
        string reason
        string description
        int points
        date issuedDate
        json attachments
    }

    HealthRecord {
        string id PK
        string studentId FK
        string bloodType
        float height
        float weight
        json allergies
        json conditions
        json medications
        string emergencyContact
        datetime updatedAt
    }

    HealthIncident {
        string id PK
        string studentId FK
        string campusId FK
        string recordedBy FK
        string type
        string description
        string treatment
        boolean parentNotified
        datetime occurredAt
    }

    Equipment {
        string id PK
        string campusId FK
        string name
        string category
        string serialNumber
        string location
        string status
        date purchaseDate
        date warrantyExpiry
        float purchasePrice
        string assignedTo
    }

    AlumniRecord {
        string id PK
        string studentId FK
        string campusId FK
        int graduationYear
        string nextSchool
        string nextGrade
        string notes
        boolean keepInTouch
        datetime createdAt
    }

    StudentProfile ||--o{ StudentClassEnrollment : "enrolled in"
    ClassRoom ||--o{ StudentClassEnrollment : "contains"
    ClassRoom ||--o{ Attendance : "has"
    StudentProfile ||--o{ Attendance : "tracked by"
    StudentProfile ||--o{ RewardDiscipline : "receives"
    StudentProfile ||--o{ HealthRecord : "has one"
    StudentProfile ||--o{ HealthIncident : "has"
    StudentProfile ||--o{ AlumniRecord : "becomes"
```

---

## 4. ERD — Finance ERP

```mermaid
erDiagram
    TuitionPackage {
        string id PK
        string orgId FK
        string campusId FK
        string name
        float price
        int durationMonths
        json subjects
        json features
        boolean isActive
        datetime createdAt
    }

    Invoice {
        string id PK
        string orgId FK
        string campusId FK
        string studentId FK
        string packageId FK
        string invoiceNumber UK
        json lineItems
        float subtotal
        float discountAmount
        float taxAmount
        float totalAmount
        float paidAmount
        string currency
        string status
        date dueDate
        date periodStart
        date periodEnd
        string voucherId FK
        string scholarshipId FK
        datetime createdAt
        datetime updatedAt
    }

    Payment {
        string id PK
        string invoiceId FK
        string processedBy FK
        float amount
        string method
        string transactionRef
        string gatewayRef
        string status
        json metadata
        datetime paidAt
        datetime createdAt
    }

    Refund {
        string id PK
        string paymentId FK
        string requestedBy FK
        string approvedBy FK
        float amount
        string reason
        string status
        string method
        datetime requestedAt
        datetime processedAt
    }

    Voucher {
        string id PK
        string orgId FK
        string code UK
        string name
        string discountType
        float discountValue
        float maxDiscount
        float minInvoiceAmount
        json conditions
        date validFrom
        date validTo
        int usageLimit
        int usedCount
        boolean isActive
    }

    Scholarship {
        string id PK
        string orgId FK
        string studentId FK
        string approvedBy FK
        string name
        float amount
        string type
        string reason
        date startDate
        date endDate
        boolean isActive
        datetime createdAt
    }

    InstallmentPlan {
        string id PK
        string invoiceId FK
        int totalInstallments
        json schedule
        string status
        datetime createdAt
    }

    TuitionPackage ||--o{ Invoice : "applied to"
    Invoice ||--o{ Payment : "paid by"
    Invoice ||--o{ InstallmentPlan : "has"
    Payment ||--o{ Refund : "refunded"
    Voucher ||--o{ Invoice : "applied to"
    Scholarship ||--o{ Invoice : "applied to"
```

---

## 5. ERD — CRM

```mermaid
erDiagram
    Lead {
        string id PK
        string orgId FK
        string campusId FK
        string assignedTo FK
        string name
        string phone UK
        string email
        string childName
        int childAge
        string currentSchool
        string gradeInterested
        string source
        string status
        string stage
        int leadScore
        json tags
        datetime createdAt
        datetime updatedAt
    }

    PipelineActivity {
        string id PK
        string leadId FK
        string userId FK
        string type
        string stage
        string notes
        date nextActionDate
        string nextActionType
        json metadata
        datetime createdAt
    }

    Campaign {
        string id PK
        string orgId FK
        string campusId FK
        string createdBy FK
        string name
        string channel
        string status
        json targetAudience
        float budget
        float spent
        int leadsGenerated
        int conversions
        date startDate
        date endDate
        json adAccounts
        datetime createdAt
    }

    Lead ||--o{ PipelineActivity : "has"
    Campaign ||--o{ Lead : "generates"
```

---

## 6. ERD — HRM

```mermaid
erDiagram
    StaffProfile {
        string id PK
        string userId FK
        string orgId FK
        string primaryCampusId FK
        string employeeCode UK
        string contractType
        float baseSalary
        string salaryType
        json campusIds
        json roles
        date startDate
        date endDate
        string status
        json bankInfo
        datetime createdAt
    }

    Contract {
        string id PK
        string staffId FK
        string type
        date startDate
        date endDate
        float salary
        json benefits
        string status
        json attachments
        datetime signedAt
    }

    Timesheet {
        string id PK
        string staffId FK
        string campusId FK
        date workDate
        datetime checkIn
        datetime checkOut
        float hoursWorked
        string status
        string note
        string source
    }

    LeaveRequest {
        string id PK
        string staffId FK
        string approvedBy FK
        string type
        date fromDate
        date toDate
        int totalDays
        string reason
        string status
        string note
        datetime requestedAt
        datetime processedAt
    }

    KPIRecord {
        string id PK
        string staffId FK
        string setBy FK
        string period
        json targets
        json results
        float score
        string grade
        string notes
        datetime evaluatedAt
    }

    Payroll {
        string id PK
        string staffId FK
        string processedBy FK
        string period
        float baseSalary
        float allowances
        float bonuses
        float deductions
        float taxAmount
        float netSalary
        string status
        datetime processedAt
        datetime paidAt
    }

    RecruitmentJob {
        string id PK
        string campusId FK
        string createdBy FK
        string title
        string department
        string type
        string description
        json requirements
        string status
        date deadline
        datetime createdAt
    }

    StaffProfile ||--o{ Contract : "has"
    StaffProfile ||--o{ Timesheet : "logs"
    StaffProfile ||--o{ LeaveRequest : "requests"
    StaffProfile ||--o{ KPIRecord : "evaluated by"
    StaffProfile ||--o{ Payroll : "receives"
```

---

## 7. ERD — Collaboration

```mermaid
erDiagram
    Meeting {
        string id PK
        string orgId FK
        string campusId FK
        string createdBy FK
        string title
        string description
        json attendees
        json agenda
        datetime scheduledAt
        int durationMinutes
        string location
        string videoLink
        string status
        string transcriptUrl
        json aiSummary
        datetime createdAt
    }

    Task {
        string id PK
        string orgId FK
        string campusId FK
        string createdBy FK
        string assigneeId FK
        string parentTaskId FK
        string meetingId FK
        string title
        string description
        string priority
        string status
        date dueDate
        json checklist
        json attachments
        datetime completedAt
        datetime createdAt
    }

    CalendarEvent {
        string id PK
        string orgId FK
        string createdBy FK
        string title
        string type
        string description
        datetime startAt
        datetime endAt
        boolean allDay
        json campusIds
        string visibility
        string color
        boolean isHoliday
        json recurrence
        datetime createdAt
    }

    ApprovalRequest {
        string id PK
        string orgId FK
        string campusId FK
        string requestedBy FK
        string type
        string title
        string description
        json formData
        json approvers
        string status
        string currentStep
        json history
        datetime requestedAt
        datetime completedAt
    }

    Meeting ||--o{ Task : "generates"
```

---

## 8. ERD — AI Timetable Engine

```mermaid
erDiagram
    TimetableSlot {
        string id PK
        string versionId FK
        string classRoomId FK
        string subjectId FK
        string teacherId FK
        string roomId FK
        string semesterId FK
        int dayOfWeek
        int periodNumber
        time startTime
        time endTime
        boolean isRecurring
        datetime createdAt
    }

    TimetableConstraint {
        string id PK
        string campusId FK
        string orgId FK
        string type
        json value
        string priority
        boolean isHard
        string description
        boolean isActive
    }

    TimetableVersion {
        string id PK
        string semesterId FK
        string campusId FK
        string generatedBy FK
        string status
        int conflictCount
        float optimizationScore
        json aiMetadata
        datetime generatedAt
        datetime publishedAt
        boolean isActive
    }

    Subject {
        string id PK
        string orgId FK
        string departmentId FK
        string name
        string code
        int periodsPerWeek
        int totalLessons
        string description
        boolean isActive
    }

    TimetableVersion ||--o{ TimetableSlot : "contains"
    Subject ||--o{ TimetableSlot : "scheduled in"
    Room ||--o{ TimetableSlot : "used by"
    TimetableConstraint ||--o{ TimetableVersion : "applied to"
```

---

## 9. Key Design Decisions

### Multi-Campus Data Isolation
```sql
-- Mọi query đều filter theo orgId và/hoặc campusId
SELECT * FROM "StudentProfile" 
WHERE "orgId" = :orgId 
  AND "currentCampusId" = :campusId
  AND "deletedAt" IS NULL;
```

### Soft Delete Pattern
```sql
-- Không xóa thật, chỉ đánh dấu
UPDATE "StudentProfile" 
SET "deletedAt" = NOW(), "updatedBy" = :userId
WHERE id = :id AND "orgId" = :orgId;
```

### Audit Trail
```sql
-- Mọi bảng đều có
createdAt    TIMESTAMP NOT NULL DEFAULT NOW()
updatedAt    TIMESTAMP NOT NULL
createdBy    VARCHAR REFERENCES "User"(id)
updatedBy    VARCHAR REFERENCES "User"(id)
deletedAt    TIMESTAMP  -- null = active
```

### Indexes Quan Trọng
```sql
-- Student lookup
CREATE INDEX idx_student_org_campus ON "StudentProfile"(orgId, currentCampusId);
CREATE INDEX idx_student_class ON "StudentProfile"(currentClassId);

-- Attendance
CREATE INDEX idx_attendance_class_date ON "Attendance"(classRoomId, attendanceDate);

-- Invoice
CREATE INDEX idx_invoice_student ON "Invoice"(studentId, status);
CREATE INDEX idx_invoice_due ON "Invoice"(dueDate, status) WHERE status != 'paid';

-- Lead
CREATE INDEX idx_lead_stage ON "Lead"(orgId, campusId, stage);
CREATE INDEX idx_lead_assigned ON "Lead"(assignedTo, stage);
```

---

*Document prepared by AvaB Architecture Team — 2026-07-04*
