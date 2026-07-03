# AvaB V1.0 — Component Library

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft

---

## Status Legend

| Symbol | Nghĩa |
|--------|-------|
| ✅ | Đã có trong codebase |
| 🚧 | Đang phát triển |
| 📋 | Cần xây dựng |

---

## Group 1: Foundation

### Button
**Status:** 🚧  
**Mô tả:** Component button cơ bản cho mọi hành động trong hệ thống.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `variant` | `primary\|secondary\|ghost\|danger\|ai` | `primary` | Kiểu button |
| `size` | `xs\|sm\|md\|lg` | `md` | Kích thước |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `disabled` | `boolean` | `false` | Vô hiệu hóa |
| `leftIcon` | `ReactNode` | — | Icon bên trái |
| `rightIcon` | `ReactNode` | — | Icon bên phải |
| `fullWidth` | `boolean` | `false` | Chiều rộng 100% |

**Variants:** primary, secondary, ghost, outline, danger, ai (orange gradient for AI actions)  
**Dùng ở:** Mọi nơi

---

### Badge / Tag
**Status:** 📋  
**Mô tả:** Nhãn nhỏ hiển thị trạng thái, category, hoặc số lượng.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `variant` | `default\|success\|warning\|error\|info\|ai` | `default` | Kiểu màu |
| `size` | `sm\|md` | `sm` | Kích thước |
| `rounded` | `boolean` | `true` | Bo tròn pill style |
| `removable` | `boolean` | `false` | Có nút xóa không |

**Variants:** default (gray), success (green), warning (amber), error (red), info (blue), ai (orange), subject colors  
**Dùng ở:** Status indicators, subject tags, difficulty levels, role badges

---

### Avatar
**Status:** 📋  
**Mô tả:** Ảnh đại diện người dùng với fallback initials.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `src` | `string` | — | URL ảnh |
| `name` | `string` | — | Tên (fallback initials) |
| `size` | `xs\|sm\|md\|lg\|xl` | `md` | Kích thước |
| `shape` | `circle\|square` | `circle` | Hình dạng |
| `status` | `online\|offline\|away` | — | Chấm trạng thái |

**Dùng ở:** User lists, comments, teacher card, navigation header

---

### Spinner / Loading
**Status:** 📋  
**Mô tả:** Animation chỉ trạng thái đang xử lý.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `size` | `xs\|sm\|md\|lg` | `md` | Kích thước |
| `color` | `primary\|white\|ai` | `primary` | Màu sắc |
| `label` | `string` | — | Text kèm theo |

**Variants:** Circle spinner, Dots (AI typing indicator), Progress bar, Skeleton  
**Dùng ở:** Button loading, page loading, AI generation

---

### Skeleton
**Status:** 📋  
**Mô tả:** Placeholder khi content đang load.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `width` | `string` | `100%` | Chiều rộng |
| `height` | `string` | `16px` | Chiều cao |
| `rounded` | `boolean` | `false` | Bo góc |
| `lines` | `number` | — | Số dòng tự động |

**Dùng ở:** Card loading, list loading, content loading

---

## Group 2: Layout

### Card
**Status:** 🚧  
**Mô tả:** Container cơ bản cho mọi loại nội dung.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `variant` | `default\|elevated\|bordered\|flat` | `default` | Kiểu card |
| `padding` | `none\|sm\|md\|lg` | `md` | Padding nội tại |
| `hoverable` | `boolean` | `false` | Hover effect |
| `clickable` | `boolean` | `false` | Click cursor |

**Sub-components:** Card.Header, Card.Body, Card.Footer  
**Dùng ở:** Dashboard widgets, Course cards, Student cards, Question cards

---

### Panel
**Status:** 📋  
**Mô tả:** Panel lớn hơn Card, thường dùng cho sidebar hoặc detail view.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `position` | `left\|right\|bottom` | `right` | Vị trí (cho split view) |
| `width` | `string` | `320px` | Chiều rộng cố định |
| `collapsible` | `boolean` | `false` | Có thể thu nhỏ |

**Dùng ở:** AI Tutor panel, Course structure panel, Filter panel

---

### Grid
**Status:** 📋  
**Mô tả:** Responsive grid layout.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `cols` | `1\|2\|3\|4\|5\|6` | `3` | Số cột |
| `gap` | `sm\|md\|lg` | `md` | Khoảng cách |
| `responsive` | `boolean` | `true` | Responsive tự động |

**Dùng ở:** Course library, Question grid, Asset library, Dashboard widgets

---

### Divider
**Status:** 📋  
**Mô tả:** Đường phân cách nội dung.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `orientation` | `horizontal\|vertical` | `horizontal` | Hướng |
| `label` | `string` | — | Text ở giữa |
| `variant` | `solid\|dashed\|dotted` | `solid` | Kiểu đường |

---

### EmptyState
**Status:** 📋  
**Mô tả:** Hiển thị khi không có data.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `icon` | `ReactNode` | — | Icon minh họa |
| `title` | `string` | required | Tiêu đề |
| `description` | `string` | — | Mô tả |
| `action` | `ReactNode` | — | CTA button |

**Dùng ở:** Empty course list, No results found, No notifications

---

## Group 3: Navigation

### Sidebar
**Status:** 🚧  
**Mô tả:** Sidebar navigation chính của ứng dụng.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `collapsed` | `boolean` | `false` | Thu nhỏ (icon-only) |
| `items` | `NavItem[]` | required | Danh sách menu |
| `role` | `Role` | required | Role để filter items |

**Dùng ở:** Admin layout, Teacher layout

---

### Breadcrumb
**Status:** 📋  
**Mô tả:** Đường dẫn phân cấp trang.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `items` | `BreadcrumbItem[]` | required | Danh sách cấp |
| `separator` | `ReactNode` | `/` | Ký tự phân cách |
| `maxItems` | `number` | 4 | Số item tối đa trước khi collapse |

**Dùng ở:** Admin pages, Course Studio, Content Studio

---

### Tabs
**Status:** 🚧  
**Mô tả:** Tab navigation cho content phân loại.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `items` | `TabItem[]` | required | Danh sách tab |
| `variant` | `line\|pills\|boxed` | `line` | Kiểu tab |
| `size` | `sm\|md\|lg` | `md` | Kích thước |
| `controlled` | `boolean` | `false` | Có controlled không |

**Dùng ở:** Course detail, User profile, Analytics sections

---

### Pagination
**Status:** 📋  
**Mô tả:** Phân trang danh sách.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `total` | `number` | required | Tổng số items |
| `pageSize` | `number` | 20 | Items mỗi trang |
| `currentPage` | `number` | 1 | Trang hiện tại |
| `onChange` | `function` | required | Callback |
| `showSizeChanger` | `boolean` | `false` | Cho đổi page size |

**Dùng ở:** User list, Course library, Question bank

---

### BottomNav (Mobile)
**Status:** 📋  
**Mô tả:** Bottom navigation cho mobile.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `items` | `NavItem[]` | required | Tối đa 5 items |
| `activeIndex` | `number` | — | Tab đang active |

**Dùng ở:** Student mobile app, Parent mobile app

---

## Group 4: Form

### Input
**Status:** 🚧  
**Mô tả:** Text input cơ bản.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `type` | `text\|email\|password\|number\|search` | `text` | Loại input |
| `size` | `sm\|md\|lg` | `md` | Kích thước |
| `label` | `string` | — | Label |
| `placeholder` | `string` | — | Placeholder |
| `errorMessage` | `string` | — | Thông báo lỗi |
| `helperText` | `string` | — | Ghi chú |
| `leftAddon` | `ReactNode` | — | Icon/text bên trái |
| `rightAddon` | `ReactNode` | — | Icon/text bên phải |
| `required` | `boolean` | `false` | Bắt buộc |

**Dùng ở:** Mọi form input

---

### Textarea
**Status:** 🚧  
**Mô tả:** Multi-line text input.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `rows` | `number` | 3 | Số dòng mặc định |
| `autoResize` | `boolean` | `true` | Tự co giãn |
| `maxLength` | `number` | — | Ký tự tối đa |
| `showCount` | `boolean` | `false` | Hiện bộ đếm |

**Dùng ở:** Question content, Lesson description, AI prompt

---

### Select / Dropdown
**Status:** 🚧  
**Mô tả:** Dropdown chọn giá trị.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `options` | `Option[]` | required | Danh sách chọn |
| `multiple` | `boolean` | `false` | Chọn nhiều |
| `searchable` | `boolean` | `false` | Có tìm kiếm |
| `clearable` | `boolean` | `false` | Có nút xóa |
| `placeholder` | `string` | — | Text mặc định |
| `groupBy` | `string` | — | Nhóm options |

**Dùng ở:** Subject select, Grade select, Status filter

---

### Checkbox / Radio
**Status:** 🚧  
**Mô tả:** Lựa chọn true/false hoặc một trong nhiều.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `label` | `string` | — | Text kèm |
| `checked` | `boolean` | — | Trạng thái |
| `indeterminate` | `boolean` | — | Partial check |
| `size` | `sm\|md` | `md` | Kích thước |

**Dùng ở:** MCQ answers, Permission checkboxes, Settings toggles

---

### Switch / Toggle
**Status:** 📋  
**Mô tả:** Toggle on/off.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `checked` | `boolean` | required | Trạng thái |
| `label` | `string` | — | Label |
| `size` | `sm\|md` | `md` | Kích thước |
| `loading` | `boolean` | `false` | Đang toggle |

**Dùng ở:** Settings, Feature flags, Active/Inactive status

---

### DatePicker
**Status:** 📋  
**Mô tả:** Chọn ngày/tháng/năm.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `mode` | `date\|month\|year\|range` | `date` | Chế độ |
| `minDate` | `Date` | — | Ngày nhỏ nhất |
| `maxDate` | `Date` | — | Ngày lớn nhất |
| `placeholder` | `string` | `DD/MM/YYYY` | — |

**Dùng ở:** Homework due date, Class schedule, Finance period

---

### RichTextEditor
**Status:** 🚧  
**Mô tả:** Soạn thảo nội dung bài học với rich formatting.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `value` | `string` | — | HTML content |
| `onChange` | `function` | required | Callback |
| `toolbar` | `ToolbarConfig` | `full` | Cấu hình toolbar |
| `height` | `string` | `400px` | Chiều cao |
| `readOnly` | `boolean` | `false` | Chỉ đọc |

**Toolbar items:** Bold, Italic, Underline, Headings, Lists, Table, Image, Video embed, Math (KaTeX), Code block, Links  
**Dùng ở:** Lesson Editor, Question content, News editor

---

### FileUpload
**Status:** 📋  
**Mô tả:** Upload file với drag & drop.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `accept` | `string` | — | Loại file chấp nhận |
| `maxSize` | `number` | 10MB | Kích thước tối đa |
| `multiple` | `boolean` | `false` | Upload nhiều file |
| `onUpload` | `function` | required | Callback |
| `preview` | `boolean` | `true` | Xem trước |

**Dùng ở:** Asset library upload, Homework file submission, Avatar upload

---

### SearchBar
**Status:** 📋  
**Mô tả:** Thanh tìm kiếm với autocomplete.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `placeholder` | `string` | `Tìm kiếm...` | — |
| `suggestions` | `string[]` | — | Gợi ý tìm kiếm |
| `onSearch` | `function` | required | Callback |
| `debounceMs` | `number` | 300 | Độ trễ |
| `shortcut` | `string` | `Cmd+K` | Phím tắt |

**Dùng ở:** Global search, Question bank search, Course library search

---

## Group 5: Data Display

### DataTable
**Status:** 🚧  
**Mô tả:** Bảng dữ liệu có sort, filter, pagination.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `columns` | `Column[]` | required | Định nghĩa cột |
| `data` | `any[]` | required | Dữ liệu |
| `loading` | `boolean` | `false` | Loading state |
| `sortable` | `boolean` | `true` | Cho phép sort |
| `selectable` | `boolean` | `false` | Checkbox chọn hàng |
| `onRowClick` | `function` | — | Click vào hàng |
| `emptyText` | `string` | `Không có dữ liệu` | — |
| `stickyHeader` | `boolean` | `true` | Header cố định |

**Dùng ở:** User list, Enrollment list, Question bank, Payment list

---

### StatCard
**Status:** 🚧  
**Mô tả:** Widget hiển thị số liệu thống kê.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `title` | `string` | required | Tên chỉ số |
| `value` | `string\|number` | required | Giá trị |
| `change` | `number` | — | % thay đổi |
| `icon` | `ReactNode` | — | Icon |
| `color` | `string` | — | Màu accent |
| `trend` | `up\|down\|flat` | — | Xu hướng |

**Dùng ở:** Dashboard overview, Analytics summary

---

### ProgressBar
**Status:** 📋  
**Mô tả:** Thanh tiến độ.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `value` | `number` | required | Giá trị (0-100) |
| `color` | `string` | `primary` | Màu |
| `size` | `xs\|sm\|md\|lg` | `md` | Độ dày |
| `showLabel` | `boolean` | `false` | Hiện % |
| `animated` | `boolean` | `false` | Animation |

**Dùng ở:** Course completion, Student progress, Job queue progress

---

### Timeline
**Status:** 📋  
**Mô tả:** Hiển thị chuỗi sự kiện theo thời gian.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `items` | `TimelineItem[]` | required | Danh sách events |
| `orientation` | `vertical\|horizontal` | `vertical` | Hướng |
| `alternating` | `boolean` | `false` | Xen kẽ trái-phải |

**Dùng ở:** Approval history, Content version history, Activity log

---

### Chart (wrapper)
**Status:** 📋  
**Mô tả:** Wrapper cho Recharts/Chart.js charts.

**Types:** LineChart, BarChart, PieChart, AreaChart, RadarChart  
**Dùng ở:** Analytics Center, Student progress, Financial reports

---

### TreeView
**Status:** 📋  
**Mô tả:** Hiển thị cấu trúc cây (Course structure).

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `data` | `TreeNode[]` | required | Cây dữ liệu |
| `expandAll` | `boolean` | `false` | Mở rộng tất cả |
| `selectable` | `boolean` | `false` | Cho chọn node |
| `draggable` | `boolean` | `false` | Drag & drop reorder |
| `onSelect` | `function` | — | Callback chọn |

**Dùng ở:** Course Studio (Chapter/Topic/Lesson tree), File browser

---

### KanbanBoard
**Status:** 📋  
**Mô tả:** Board dạng kanban cho Job Queue / Approval Flow.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `columns` | `KanbanColumn[]` | required | Danh sách cột |
| `cards` | `KanbanCard[]` | required | Danh sách cards |
| `draggable` | `boolean` | `true` | Drag giữa cột |
| `onMove` | `function` | — | Callback move card |

**Dùng ở:** Job Queue view, Approval workflow

---

## Group 6: Feedback

### Toast / Notification
**Status:** 🚧  
**Mô tả:** Thông báo pop-up ngắn.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `type` | `success\|error\|warning\|info` | `info` | Kiểu |
| `title` | `string` | — | Tiêu đề |
| `message` | `string` | required | Nội dung |
| `duration` | `number` | `4000` | Thời gian hiện (ms) |
| `position` | `top-right\|bottom-right\|top-center` | `top-right` | Vị trí |
| `action` | `ReactNode` | — | Action button |

**Dùng ở:** Mọi action success/error feedback

---

### Modal / Dialog
**Status:** 🚧  
**Mô tả:** Dialog popup cho confirmation và forms.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `isOpen` | `boolean` | required | Mở/đóng |
| `onClose` | `function` | required | Callback đóng |
| `title` | `string` | — | Tiêu đề |
| `size` | `sm\|md\|lg\|xl\|fullscreen` | `md` | Kích thước |
| `closeOnOverlayClick` | `boolean` | `true` | Click ngoài để đóng |

**Sub-types:** ConfirmDialog, FormModal, PreviewModal  
**Dùng ở:** Delete confirm, Create/edit forms, Content preview

---

### Alert
**Status:** 📋  
**Mô tả:** Banner thông báo inline.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `type` | `success\|error\|warning\|info` | `info` | Kiểu |
| `title` | `string` | — | Tiêu đề |
| `message` | `string` | required | Nội dung |
| `dismissible` | `boolean` | `false` | Có nút đóng |
| `icon` | `boolean` | `true` | Hiện icon |

**Dùng ở:** Form errors, System announcements, Warning banners

---

### Tooltip
**Status:** 📋  
**Mô tả:** Popup giải thích khi hover.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `content` | `string\|ReactNode` | required | Nội dung |
| `placement` | `top\|bottom\|left\|right` | `top` | Vị trí |
| `delay` | `number` | `300` | Độ trễ hiện (ms) |
| `arrow` | `boolean` | `true` | Hiện mũi tên |

**Dùng ở:** Icon buttons, Truncated text, Feature hints

---

### ConfirmDialog
**Status:** 📋  
**Mô tả:** Dialog xác nhận trước khi thực hiện hành động nguy hiểm.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `title` | `string` | required | Tiêu đề xác nhận |
| `message` | `string` | required | Mô tả nguy hiểm |
| `confirmText` | `string` | `Xác nhận` | Text nút xác nhận |
| `cancelText` | `string` | `Hủy` | Text nút hủy |
| `danger` | `boolean` | `false` | Danger style |
| `typeToConfirm` | `string` | — | Gõ để xác nhận |

**Dùng ở:** Delete course, Delete user, Publish content

---

## Group 7: Content (Education-specific)

### CourseCard
**Status:** 🚧  
**Mô tả:** Card hiển thị thông tin khóa học.

**Props:** title, subject, grade, status, thumbnail, progress, studentCount, author  
**Variants:** grid-card, list-item, compact  
**Dùng ở:** Course Library, Dashboard, Search results

---

### LessonPlayer
**Status:** 📋  
**Mô tả:** Trình phát bài học với navigation.

**Features:**
- Content renderer (HTML/Markdown)
- Video embed player
- Audio player
- Interactive elements
- Progress tracking (time on task)
- Navigation: Previous/Next lesson
- Bookmark / Note taking

**Dùng ở:** Student Center - Học bài

---

### QuestionCard
**Status:** 📋  
**Mô tả:** Hiển thị và làm câu hỏi.

**Variants:**
- MCQ (Multiple Choice)
- Fill-in-the-blank
- True/False
- Matching
- Essay (with rich text)
- Image-based question
- Audio-based question

**Props:** question, options, correctAnswer (hidden), studentAnswer, mode (view/answer/review), showExplanation  
**Dùng ở:** Assessment taker, Question bank preview

---

### AssessmentRunner
**Status:** 📋  
**Mô tả:** Giao diện làm bài kiểm tra đầy đủ.

**Features:**
- Timer countdown
- Question navigation sidebar
- Question flagging
- Auto-save answers
- Submit with confirmation
- Result view with correct answers

**Dùng ở:** Student Center - Làm bài kiểm tra

---

### ProgressRing
**Status:** 📋  
**Mô tả:** Vòng tròn tiến độ cho gamification.

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `value` | `number` | required | % hoàn thành |
| `size` | `sm\|md\|lg` | `md` | Kích thước |
| `label` | `string` | — | Label ở giữa |
| `color` | `string` | `primary` | Màu vòng |

**Dùng ở:** Student dashboard, Course completion, Subject progress

---

### XPBadge
**Status:** 📋  
**Mô tả:** Hiển thị điểm XP và cấp độ học viên.

**Props:** xp, level, badge icon, streak count  
**Dùng ở:** Student profile, Dashboard, Leaderboard

---

### ContentTree
**Status:** 📋  
**Mô tả:** Cây nội dung khóa học có thể tương tác.

**Features:**
- Expand/collapse chapters
- Completion status indicator
- Drag & drop reorder (edit mode)
- Add/remove nodes
- Context menu per node

**Dùng ở:** Course Studio (cấu trúc khóa học)

---

### AIGenerationPanel
**Status:** 🚧  
**Mô tả:** Panel điều khiển AI generation với status.

**Features:**
- Configuration form
- Submit button
- Real-time job status
- Progress indicator
- Generated content preview
- Regenerate / Edit options

**Dùng ở:** AI Studio, Course Studio

---

### JobStatusCard
**Status:** 📋  
**Mô tả:** Card hiển thị trạng thái một AI job.

**Props:** jobId, type, status, progress, startedAt, estimatedTime, error  
**Variants:** Pending (yellow pulse), Running (progress bar), Completed (green), Failed (red retry)  
**Dùng ở:** AI Studio - Job Queue, Dashboard - Recent Jobs

---

## Group 8: AI-specific

### AIChatInterface
**Status:** 📋  
**Mô tả:** Giao diện chat với AI Tutor.

**Features:**
- Message bubbles (user/AI)
- Typing indicator (dot animation)
- Code blocks với syntax highlight
- Math rendering (KaTeX)
- Suggested questions
- Copy button cho AI answers
- Clear conversation

**Dùng ở:** AI Tutor (/hoc-vien/ai-tutor)

---

### AIPromptBuilder
**Status:** 📋  
**Mô tả:** Interface xây dựng và chỉnh sửa AI prompt.

**Features:**
- Template variables highlighting
- Token count indicator
- Test prompt button
- Prompt history
- Preset templates

**Dùng ở:** AI Studio - Prompt Templates

---

### GeneratedContentPreview
**Status:** 📋  
**Mô tả:** Xem trước nội dung AI đã tạo ra với actions.

**Features:**
- Side-by-side (prompt/output)
- Accept / Edit / Regenerate buttons
- Quality score indicator
- Issue highlights (QA flags)

**Dùng ở:** Course Studio, AI Studio

---

## Tóm tắt danh sách theo status

### ✅ Đã có (cần review & standardize)
*Phần lớn components hiện tại là ad-hoc, cần refactor theo design system*

### 🚧 Đang xây (Sprint 1-2)
- Button, Card, Tabs, Sidebar, DataTable, Modal, Toast
- RichTextEditor, Input, Select, Checkbox
- CourseCard, AIGenerationPanel

### 📋 Cần xây (Sprint 3+)
- Tất cả components còn lại trong tài liệu này
- Ưu tiên theo user flow: Student Center → Teacher Center → Admin → AI Studio

---

*Component library này sẽ được implement vào Storybook để documentation và testing.*
