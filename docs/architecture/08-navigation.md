# AvaB V1.0 — Navigation Architecture

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft

---

## 1. Tổng quan Navigation System

AvaB sử dụng 4 lớp navigation phối hợp với nhau:

```
Layer 1: Top Navigation Bar    → Global actions, user menu, notifications
Layer 2: Side Navigation       → Primary workspace navigation
Layer 3: Breadcrumb            → Hierarchical location indicator
Layer 4: Tab Navigation        → Content sections within a page
```

---

## 2. Top Navigation Bar (Header)

### 2.1 Cấu trúc

```
[≡ Menu]  [AvaB Logo]  [Global Search ⌘K]  [..............]  [🔔 Notif]  [? Help]  [Avatar ▾]
```

### 2.2 Elements

| Element | Mô tả | Mobile | Desktop |
|---------|-------|--------|---------|
| Hamburger Menu | Toggle sidebar (mobile) | ✅ | ❌ |
| Logo | Click về Dashboard | ✅ | ✅ |
| Global Search | Tìm kiếm toàn hệ thống, shortcut `⌘K` | Icon only | Full bar |
| School Name | Tên trường/school context | ❌ | ✅ |
| AI Job Indicator | Badge khi có job đang chạy | ❌ | ✅ |
| Notification Bell | Số thông báo chưa đọc | ✅ | ✅ |
| Help | Docs, shortcuts, support | ❌ | ✅ |
| User Avatar | Dropdown: profile, settings, logout | ✅ | ✅ |

### 2.3 User Avatar Dropdown

```
[User Name]
[Role Badge]
─────────────
👤 Hồ sơ của tôi
⚙️ Cài đặt tài khoản
🌙 Chế độ tối
🌐 Ngôn ngữ
─────────────
🚪 Đăng xuất
```

### 2.4 Global Search Panel

**Trigger:** Click search bar hoặc `⌘K` / `Ctrl+K`

```
╔═══════════════════════════════════════╗
║ 🔍 Tìm kiếm...                     ⌘K ║
╠═══════════════════════════════════════╣
║ Tìm kiếm gần đây                      ║
║  • Toán lớp 5 HK1                      ║
║  • Nguyễn Văn A                        ║
╠═══════════════════════════════════════╣
║ Kết quả                                ║
║  📚 Courses (3)                        ║
║    > Toán 5 Học kỳ 1                   ║
║  👤 Users (2)                          ║
║    > Nguyễn Văn A (học viên)           ║
║  ❓ Questions (8)                      ║
║    > Phép cộng số tự nhiên             ║
╚═══════════════════════════════════════╝
```

---

## 3. Side Navigation (Sidebar)

### 3.1 Trạng thái Sidebar

| State | Width | Hiển thị | Trigger |
|-------|-------|---------|---------|
| Expanded | 280px | Icon + Text | Default (desktop) |
| Collapsed | 64px | Icon only | Click toggle |
| Hidden | 0px | — | Mobile (drawer thay thế) |

### 3.2 Sidebar Structure

```
╔══════════════════════════════╗
║ [AvaB] [School Name]  [≤]   ║  ← Logo + collapse button
╠══════════════════════════════╣
║                               ║
║  🏠 Dashboard                 ║
║                               ║
║  ─── NỘI DUNG ─────────────  ║  ← Section label
║  📚 Course Studio             ║
║  📖 Course Library            ║
║  ✏️  Content Studio           ║
║  ❓ Question Bank             ║
║  🖼️  Asset Library            ║
║                               ║
║  ─── AI ───────────────────  ║
║  🤖 AI Studio          [3]   ║  ← Badge: jobs running
║  📡 Publishing Center   [5]  ║  ← Badge: pending review
║                               ║
║  ─── NGƯỜI DÙNG ───────────  ║
║  👩‍🏫 Teacher Center           ║
║  👨‍🎓 Student Center           ║
║  👨‍👩‍👧 Parent Center           ║
║  🏫 Class Management          ║
║                               ║
║  ─── PHÂN TÍCH ────────────  ║
║  📊 Analytics Center          ║
║                               ║
║ ═════════════════════════════ ║
║  ⚙️  Settings                 ║
║  ❓ Help & Docs               ║
╚══════════════════════════════╝
```

### 3.3 Collapsed Sidebar (Icon only)

```
╔════╗
║ 🏠 ║
╠════╣
║    ║
║ 📚 ║
║ 📖 ║
║ ✏️  ║
║ ❓ ║
║ 🖼️  ║
║    ║
║ 🤖 ║  ← Tooltip on hover: "AI Studio (3 jobs)"
║ 📡 ║
║    ║
║ 👩‍🏫║
║ 👨‍🎓║
║ 👨‍👩‍👧║
║ 🏫 ║
║    ║
║ 📊 ║
╠════╣
║ ⚙️  ║
║ ❓ ║
╚════╝
```

### 3.4 Active State

```css
/* Active nav item */
.nav-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 600;
  border-right: 3px solid var(--color-primary-600);
}

/* Hover */
.nav-item:hover {
  background: var(--color-neutral-100);
}
```

---

## 4. Role-based Navigation

### 4.1 Super Admin Sidebar

```
🏠 Dashboard
─── NỘI DUNG ──────────
📚 Course Studio
📖 Course Library
✏️  Content Studio
❓ Question Bank
🖼️  Asset Library
─── AI ────────────────
🤖 AI Studio
📡 Publishing Center
─── NGƯỜI DÙNG ────────
👩‍🏫 Teacher Center
👨‍🎓 Student Center
👨‍👩‍👧 Parent Center
🏫 Class Management
─── PLATFORM ──────────  ← Super Admin only section
🏢 Schools
🎓 Programs
📋 Education Standards
─── PHÂN TÍCH ─────────
📊 Analytics Center
═══════════════════════
⚙️  Settings (Platform)
```

### 4.2 School Admin Sidebar

```
🏠 Dashboard
─── NỘI DUNG ──────────
📚 Course Studio
📖 Course Library
✏️  Content Studio
❓ Question Bank
🖼️  Asset Library
─── AI ────────────────
🤖 AI Studio
📡 Publishing Center
─── QUẢN LÝ ───────────
👩‍🏫 Teacher Center
👨‍🎓 Student Center
👨‍👩‍👧 Parent Center
🏫 Class Management
💰 Finance
─── PHÂN TÍCH ─────────
📊 Analytics Center
═══════════════════════
⚙️  Settings (School)
```

### 4.3 Teacher Sidebar

```
🏠 Dashboard
─── DẠY HỌC ───────────
🏫 Lớp của tôi
📅 Lịch dạy
─── NỘI DUNG ──────────
📚 Course Studio
✏️  Content Studio
❓ Question Bank
🖼️  Asset Library
─── HỌC VIÊN ──────────
📊 Tiến độ học viên
📝 Chấm bài / Grading
═══════════════════════
⚙️  Cài đặt
```

### 4.4 Student Sidebar (hoặc Bottom Nav)

**Mobile (Bottom Nav):**
```
╔════════════════════════════════════════╗
║ 🏠        📚       📝       📊       👤 ║
║ Home    Khóa    Bài tập  Tiến độ  Hồ sơ ║
╚════════════════════════════════════════╝
```

**Desktop Sidebar:**
```
🏠 Tổng quan
─── HỌC TẬP ───────────
📚 Khóa học của tôi
📅 Lịch học
📝 Bài tập & Kiểm tra
─── THÀNH TÍCH ────────
🏆 Huy hiệu & XP
📊 Tiến độ học tập
─── AI ────────────────
🤖 AI Tutor
═══════════════════════
👤 Hồ sơ
```

### 4.5 Parent Sidebar

```
🏠 Tổng quan
─── CON CÁI ───────────
👶 Nguyễn Bé A          ← Dropdown nếu có nhiều con
   ├── Tiến độ học tập
   ├── Bài tập
   └── Điểm danh
─── TRƯỜNG ────────────
📢 Thông báo
💬 Liên lạc giáo viên
─── TÀI CHÍNH ─────────
💰 Học phí
═══════════════════════
👤 Hồ sơ
```

---

## 5. Breadcrumb Navigation

### 5.1 Pattern

```
Dashboard > Course Studio > Toán lớp 5 > Chương 1 > Bài 3
```

### 5.2 Cấu trúc HTML

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/admin">Dashboard</a></li>
    <li><span>/</span></li>
    <li><a href="/admin/course-studio">Course Studio</a></li>
    <li><span>/</span></li>
    <li><a href="/admin/course-studio/projects/123">Toán lớp 5</a></li>
    <li><span>/</span></li>
    <li aria-current="page">Chương 1 - Số tự nhiên</li>
  </ol>
</nav>
```

### 5.3 Collapse Rules

- Tối đa hiển thị 4 items
- Items ở giữa collapse thành `...` nếu dài hơn
- Click `...` expand thêm

```
Dashboard > ... > Toán lớp 5 > [Chương 1 - Số tự nhiên]
```

### 5.4 Breadcrumb per Workspace

| Workspace | Breadcrumb pattern |
|-----------|-------------------|
| Course Studio | Admin > Course Studio > [Project] > [Chapter] > [Lesson] |
| Question Bank | Admin > Question Bank > [Subject] > [Question] |
| Analytics | Admin > Analytics > [Category] > [Report] |
| Student Center | Home > [Course] > [Chapter] > [Lesson] |
| Teacher Center | Home > Lớp học > [Class] > [Section] |

---

## 6. Tab Navigation

### 6.1 Usage Contexts

**Course Detail Tabs:**
```
[📋 Tổng quan] [📚 Nội dung] [❓ Câu hỏi] [📊 Thống kê] [⚙️ Cài đặt]
```

**Student Profile Tabs:**
```
[👤 Hồ sơ] [📊 Tiến độ] [🏆 Thành tích] [📝 Lịch sử bài tập]
```

**Analytics Tabs:**
```
[📈 Tổng quan] [👨‍🎓 Học viên] [📚 Khóa học] [💰 Tài chính] [🤖 AI]
```

**AI Studio Tabs:**
```
[🤖 AI Engines] [⏳ Job Queue] [📝 Templates] [📊 Analytics]
```

### 6.2 Tab Component Behavior

- URL phản ánh tab đang chọn (`?tab=content`)
- Deep-link được hỗ trợ
- Tab state persists khi navigate back
- Mobile: scroll tabs nếu nhiều hơn 4

---

## 7. Mobile Navigation

### 7.1 Drawer (Mobile Sidebar)

- Trigger: Hamburger button top-left
- Animation: slide-in từ trái, overlay backdrop
- Close: Swipe left, click backdrop, hoặc X button

```
╔══════════════════╗
║ [X] [AvaB Logo]   ║
╠══════════════════╣
║ [User Info]       ║
╠══════════════════╣
║ 🏠 Dashboard      ║
║ 📚 Course Studio  ║
║ ❓ Question Bank  ║
║ 🤖 AI Studio     ║
║ 📊 Analytics     ║
╠══════════════════╣
║ ⚙️  Settings      ║
║ 🚪 Logout         ║
╚══════════════════╝
```

### 7.2 Bottom Navigation (Student & Parent)

**Student:**
```
╔═══════════════════════════════════╗
║  🏠    📚    📝    🏆    👤       ║
║ Trang  Học  Bài  Thành  Hồ sơ   ║
║       tập   tập   tích           ║
╚═══════════════════════════════════╝
```

**Parent:**
```
╔═══════════════════════════════════╗
║  🏠    👶    💰    📢    👤       ║
║ Trang  Con  Học  Thông  Hồ sơ   ║
║             phí   báo            ║
╚═══════════════════════════════════╝
```

### 7.3 Mobile Navigation Rules
- Bottom nav sticky, z-index cao
- Tab bar không quá 5 items
- Active tab có indicator (underline + color change)
- Badge số trên icon nếu có unread

---

## 8. Contextual / Secondary Navigation

### 8.1 Course Studio - Left Tree Panel

```
╔══════════════════════════╗
║ 📚 Toán lớp 5 HK1  [+]  ║  ← Add chapter
╠══════════════════════════╣
║ ▼ Chương 1: Số tự nhiên  ║
║   ▼ Phép cộng            ║
║     📄 Bài 1: Cộng 1 chữ ║  ← Active (highlighted)
║     📄 Bài 2: Cộng 2 chữ ║
║     📄 Bài 3: Cộng 3 chữ ║
║   ▶ Phép trừ             ║
║ ▶ Chương 2: Số thập phân ║
║ ▶ Chương 3: Phân số      ║
╚══════════════════════════╝
```

### 8.2 Assessment - Question Navigation

```
╔══════════════════════════════╗
║ Bài kiểm tra: HK1 Toán 5    ║
║ ⏰ 35:42 còn lại             ║
╠══════════════════════════════╣
║ 1✅  2✅  3⚠️  4   5         ║  ← Status per question
║ 6   7   8   9   10          ║
║ 11  12  13  14  15          ║
╠══════════════════════════════╣
║ [Câu trước]    [Câu tiếp →] ║
╠══════════════════════════════╣
║ [🚩 Đánh dấu] [Nộp bài ↑]  ║
╚══════════════════════════════╝
```

### 8.3 Lesson Player - Chapter Navigation

```
╔══════════════════════════════╗
║ ◄ Bài trước  |  Bài tiếp ►  ║
╠══════════════════════════════╣
║ Đang học: Bài 3 / 8          ║
║ ████████░░░░░░░░  40%        ║
╠══════════════════════════════╣
║ Chương 1 - Số tự nhiên       ║
║   ✅ Bài 1: Giới thiệu       ║
║   ✅ Bài 2: Cộng 1 chữ số    ║
║   ▶ Bài 3: Cộng 2 chữ số    ║  ← Current
║   🔒 Bài 4: Cộng 3 chữ số   ║  ← Locked
║   🔒 Bài 5: Luyện tập        ║
╚══════════════════════════════╝
```

---

## 9. Keyboard Navigation & Accessibility

### 9.1 Keyboard Shortcuts (Global)

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Mở Global Search |
| `⌘/` / `Ctrl+/` | Mở keyboard shortcuts help |
| `⌘N` / `Ctrl+N` | Tạo mới (context-sensitive) |
| `Esc` | Đóng modal/dropdown |
| `⌘S` / `Ctrl+S` | Lưu (trong editor) |
| `Tab` | Navigate qua elements |
| `Enter` | Activate element |
| `Space` | Toggle checkbox/radio |
| `↑↓` | Navigate list items |
| `→←` | Expand/collapse tree nodes |

### 9.2 Keyboard Shortcuts (Course Studio)

| Shortcut | Action |
|----------|--------|
| `G C` | Đi đến Course Studio |
| `G A` | Đi đến AI Studio |
| `G Q` | Đi đến Question Bank |
| `G D` | Đi đến Dashboard |

### 9.3 Focus Management

```
Focus trapping trong Modals:
- Tab → Chỉ đi trong modal elements
- Shift+Tab → Đi ngược
- Esc → Đóng modal, focus về trigger button

Skip to main content:
- First Tab từ address bar → "Skip to main content" link ẩn
- Enter → Focus nhảy xuống main content area
```

### 9.4 ARIA Labels

```html
<!-- Sidebar -->
<nav aria-label="Điều hướng chính">
  <ul role="list">
    <li>
      <a href="/admin" aria-current="page">
        <span aria-hidden="true">🏠</span>
        Dashboard
      </a>
    </li>
  </ul>
</nav>

<!-- Breadcrumb -->
<nav aria-label="Vị trí trang">...</nav>

<!-- Notification badge -->
<button aria-label="Thông báo, 5 chưa đọc">
  🔔
  <span aria-hidden="true">5</span>
</button>

<!-- Modal -->
<dialog aria-labelledby="modal-title" aria-describedby="modal-desc">
  <h2 id="modal-title">Xác nhận xóa</h2>
  <p id="modal-desc">Bạn có chắc muốn xóa khóa học này?</p>
</dialog>
```

### 9.5 Focus Indicators

```css
/* Custom focus ring - visible, không dùng browser default */
:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove focus cho mouse users, giữ cho keyboard users */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 10. Navigation Behavior Rules

### 10.1 Back Navigation

- Browser Back hoạt động bình thường với history
- Custom "Quay lại" button trong detail views
- Modal close → focus return to trigger
- Form cancel → confirm nếu có unsaved changes

### 10.2 Deep Linking

- Tất cả URLs phải deep-linkable
- URL phản ánh state: tabs, filters, pagination
- Share URL → người khác thấy cùng state (nếu có quyền)
- `?redirect=/destination` sau khi login

### 10.3 Loading States

- Route transitions: Loading bar ở top (NProgress style)
- Content loading: Skeleton placeholders
- Sidebar item click: Instant UI update, data loads after

### 10.4 Error Navigation

```
404 Not Found → Custom 404 page + link về Dashboard
403 Forbidden → Thông báo không có quyền + link phù hợp
500 Error → Error boundary + retry button
Network offline → Banner thông báo + offline mode
```

### 10.5 Redirect Rules

```
/ (unauthenticated) → /dang-nhap
/ (student) → /hoc-vien
/ (teacher) → /giao-vien
/ (parent) → /phu-huynh
/ (admin) → /admin

/admin (student) → /hoc-vien (403 redirect)
```

---

## 11. Navigation State Management

### 11.1 Persisted State

```typescript
// Lưu trong localStorage
interface NavigationState {
  sidebarCollapsed: boolean;
  lastVisitedRoute: string;
  activeTab: Record<string, string>; // per-page tab state
  expandedTreeNodes: string[];       // Course Studio tree
}
```

### 11.2 Route State

```typescript
// URL search params
/admin/question-bank?subject=math&grade=5&difficulty=medium&page=2

// Tab state
/admin/analytics?tab=students

// Preserved on back navigation
```

---

## 12. Navigation Analytics

### Tracking events

```typescript
// Track navigation patterns
trackEvent('navigation', {
  from: '/admin/course-studio',
  to: '/admin/question-bank',
  method: 'sidebar', // sidebar | breadcrumb | tab | back | search
  role: 'TEACHER',
  duration: 2340 // ms trên trang trước
});
```

---

*Navigation architecture này cần được implement nhất quán trên cả web và mobile responsive. Accessibility là bắt buộc, không phải optional.*
