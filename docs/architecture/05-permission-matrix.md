# AvaB V1.0 — Permission Matrix

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft

---

## 1. Tổng quan Roles

| Role | Mã | Mô tả | Scope |
|------|-----|-------|-------|
| Super Admin | `SUPER_ADMIN` | Toàn quyền trên toàn platform | Platform-wide |
| School Admin | `SCHOOL_ADMIN` | Quản lý trong phạm vi trường | School-scoped |
| Teacher | `TEACHER` | Giáo viên, tạo nội dung, quản lý lớp | Own classes |
| Student | `STUDENT` | Học viên | Own data |
| Parent | `PARENT` | Phụ huynh | Linked children |
| Guest | `GUEST` | Khách không đăng nhập | Public only |

---

## 2. Legend

| Ký hiệu | Nghĩa |
|---------|-------|
| ✅ | Toàn quyền (Create, Read, Update, Delete) |
| 👁️ | Chỉ xem (Read only) |
| ✏️ | Xem + Sửa (Read + Update) |
| ➕ | Tạo mới + Xem (Create + Read) |
| 🏫 | Scoped theo School |
| 📚 | Scoped theo Class mình dạy |
| 👤 | Chỉ data của bản thân |
| ❌ | Không có quyền |
| 🔒 | Platform-only (Super Admin) |

---

## 3. Ma trận phân quyền — User Management

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| View all users | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Create user | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit any user | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete user | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change any password | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Change own password | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign roles | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Deactivate user | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View user list | ✅ | 🏫 | 📚 | ❌ | ❌ | ❌ |
| Impersonate user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Ma trận phân quyền — School Management

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create school | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all schools | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit school info | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete school | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View school settings | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit school settings | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Manage school admins | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Ma trận phân quyền — Content (Program/Grade/Subject)

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create Program | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Program | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Program | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Programs | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ |
| Create Grade | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Subject | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit Subject | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View Subjects | ✅ | ✅ | ✅ | 👁️ | ❌ | ❌ |
| Create Education Standard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Education Standards | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ |

---

## 6. Ma trận phân quyền — Course Management

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create course | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Edit own course | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Edit any course | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete course | ✅ | 🏫 | 👤 Draft only | ❌ | ❌ | ❌ |
| View all courses | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View published courses | ✅ | ✅ | ✅ | 👁️ | ❌ | 👁️ Public |
| Publish course | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Submit for review | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Clone/duplicate course | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Export course | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| View course analytics | ✅ | 🏫 | 📚 | 👤 | ❌ | ❌ |
| Archive course | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |

---

## 7. Ma trận phân quyền — Content Studio (Chapter/Topic/Lesson/Activity)

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create chapter | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Edit chapter | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Delete chapter | ✅ | 🏫 | 👤 Draft | ❌ | ❌ | ❌ |
| Create lesson | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Edit own lesson | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Edit any lesson | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete lesson | ✅ | 🏫 | 👤 Draft | ❌ | ❌ | ❌ |
| View lesson (enrolled) | ✅ | ✅ | ✅ | 👁️ Enrolled | ❌ | ❌ |
| Create activity | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Use templates | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create templates | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |

---

## 8. Ma trận phân quyền — Question Bank

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create question | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Edit own question | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Edit any question | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete question | ✅ | 🏫 | 👤 Draft | ❌ | ❌ | ❌ |
| View question bank | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Import questions | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Export questions | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| AI generate questions | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Approve questions | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View correct answers | ✅ | ✅ | ✅ | ❌ After submit | ❌ | ❌ |
| Create assessment | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| Take assessment | ❌ | ❌ | ❌ | ✅ Assigned | ❌ | ❌ |
| View all results | ✅ | 🏫 | 📚 | ❌ | ❌ | ❌ |
| View own results | ✅ | ✅ | ✅ | 👤 | ❌ | ❌ |

---

## 9. Ma trận phân quyền — AI Studio

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Access AI Studio | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create AI Project | ✅ | 🏫 | ✅ | ❌ | ❌ | ❌ |
| View own AI Projects | ✅ | ✅ | 👤 | ❌ | ❌ | ❌ |
| View all AI Projects | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Configure AI engines | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit AI model settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Job Queue | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Retry failed jobs | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| Kill running jobs | ✅ | 🏫 | 👤 | ❌ | ❌ | ❌ |
| View AI costs/usage | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Manage prompt templates | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Use AI Tutor | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 10. Ma trận phân quyền — Class Management

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Delete class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View all classes | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View own classes | ✅ | ✅ | 📚 | 👁️ Enrolled | ❌ | ❌ |
| Add student to class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Remove student from class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Transfer student | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Manage attendance | ✅ | 🏫 | 📚 | ❌ | ❌ | ❌ |
| View attendance | ✅ | 🏫 | 📚 | 👤 | 👤 Child | ❌ |
| Assign course to class | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View class schedule | ✅ | ✅ | 📚 | 👤 Enrolled | 👤 Child | ❌ |

---

## 11. Ma trận phân quyền — Finance

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Create tuition collection | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Edit tuition collection | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Record payment | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View all payments | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View own payment | ✅ | ✅ | ❌ | 👤 | 👤 Child | ❌ |
| Export financial report | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Issue discount | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View unpaid list | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Send payment reminder | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |

---

## 12. Ma trận phân quyền — Analytics

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Platform-wide analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| School analytics | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Class analytics | ✅ | 🏫 | 📚 | ❌ | ❌ | ❌ |
| Student individual report | ✅ | 🏫 | 📚 | 👤 | 👤 Child | ❌ |
| Course performance | ✅ | 🏫 | 📚 Own | ❌ | ❌ | ❌ |
| AI analytics | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Export reports | ✅ | 🏫 | 📚 | ❌ | ❌ | ❌ |
| View leaderboard | ✅ | ✅ | ✅ | ✅ Class | ✅ School | ✅ Public |

---

## 13. Ma trận phân quyền — Publishing

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Submit content for review | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Review pending content | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Approve content | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Reject content | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Publish to library | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Unpublish content | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Archive content | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Restore version | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| View version history | ✅ | 🏫 | 👤 Own | ❌ | ❌ | ❌ |

---

## 14. Ma trận phân quyền — Notifications

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Send platform-wide notification | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Send school-wide notification | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Send class notification | ✅ | ✅ | 📚 | ❌ | ❌ | ❌ |
| Send individual notification | ✅ | ✅ | 📚 | ❌ | ❌ | ❌ |
| View own notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mark notification read | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View notification history | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |

---

## 15. Ma trận phân quyền — Settings

| Action | Super Admin | School Admin | Teacher | Student | Parent | Guest |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:-----:|
| Platform settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI model configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Payment gateway settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| School general settings | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| School branding | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Email/notification templates | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Own profile & avatar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Own notification prefs | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Own language/theme | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View audit logs | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |
| Integration settings | ✅ | 🏫 | ❌ | ❌ | ❌ | ❌ |

---

## 16. Data Ownership Rules

### Rule 1: School Isolation
> Mỗi School Admin chỉ thấy và quản lý data trong scope School của mình.

```
School Admin của School A:
  ✅ Có thể xem/sửa: Users của School A, Classes của School A, Finance của School A
  ❌ Không thể: Xem data của School B, Super Admin functions
```

### Rule 2: Teacher Class Isolation
> Teacher chỉ thấy data liên quan đến Class mình dạy.

```
Teacher T (dạy lớp A và lớp B):
  ✅ Có thể: Xem students của lớp A và B, attendance của lớp A và B
  ❌ Không thể: Xem students của lớp C (GV khác dạy)
```

### Rule 3: Content Ownership
> Teacher sở hữu content họ tạo ra, nhưng không thể xóa/sửa content đã publish.

```
Teacher T tạo Course X:
  ✅ Draft stage: Full CRUD
  ✅ Review stage: Xem + xử lý feedback
  ❌ Approved/Published: Chỉ xem, muốn sửa phải tạo draft version mới
```

### Rule 4: Student Data Privacy
> Student chỉ thấy data của mình. Điểm số và bài làm không chia sẻ với student khác.

```
Student S:
  ✅ Thấy: Điểm của mình, tiến độ của mình, bài làm của mình
  ❌ Không thấy: Điểm của student khác (trừ leaderboard công khai)
```

### Rule 5: Parent Visibility
> Parent chỉ thấy data của con đã được liên kết qua ParentStudentLink.

```
Parent P (linked to Student A và Student B):
  ✅ Thấy: Progress của A và B, học phí của A và B
  ❌ Không thấy: Data của student khác trong cùng lớp
```

### Rule 6: Soft Delete
> Không xóa vĩnh viễn. Mọi delete thực chất là deactivate/archive.

```
Xóa User:  isActive = false
Xóa Course: status = 'archived'
Xóa Question: status = 'archived'
Xóa Enrollment: status = 'dropped'
```

---

## 17. API Authorization Pattern

```typescript
// Middleware pattern cho API routes
export function withAuth(roles: Role[]) {
  return async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(session.user.role)) return res.status(403).json({ error: 'Forbidden' });
    
    // School isolation check
    if (session.user.role === 'SCHOOL_ADMIN') {
      req.schoolId = session.user.schoolId;
    }
    
    next();
  };
}

// Usage
export default withAuth(['SUPER_ADMIN', 'SCHOOL_ADMIN'])(handler);
```

---

*Ma trận này là source of truth cho Authorization. Mọi API endpoint cần đối chiếu với tài liệu này.*
