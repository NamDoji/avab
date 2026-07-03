# AvaB EOS v2.0 — Dashboard Per Role (Dashboard Theo Vai Trò)

> **Date:** 2026-07-04  
> **Version:** 2.0  
> **Status:** Architecture Planning

---

## Nguyên Tắc Thiết Kế Dashboard

1. **Role-first:** Mỗi role thấy đúng những gì họ cần, không hơn không kém
2. **Actionable:** Mỗi KPI/Alert dẫn đến hành động cụ thể (click-through)
3. **Real-time:** Data refresh tự động (15 phút hoặc manual refresh)
4. **Drill-down:** Click vào số → xem chi tiết
5. **AI-augmented:** AI Insights bên cạnh data thô

---

## 1. Dashboard — Chủ Trường (Org Owner / CEO)

**Mục tiêu:** Nắm toàn bộ sức khỏe doanh nghiệp trong một màn hình

### KPI Cards (Row 1 — Most Important)

```
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│  💰 DOANH THU       │  👥 HỌC SINH        │  🔄 TỶ LỆ TÁI KÝ   │  💵 CASH FLOW       │
│   Tháng này         │   Đang học          │   Tháng này         │   Ròng tháng này    │
│                     │                     │                     │                     │
│   ₫ 485.2M          │   1,247 HS          │   78.3%             │   ₫ +142.8M         │
│   ▲ +12% vs tháng T │   ▲ +23 tuần này    │   Target: 80%       │   ▲ tốt hơn T8     │
│   [Xem chi tiết →]  │   [Xem danh sách →] │   [Phân tích →]     │   [Báo cáo →]      │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

### Charts (Row 2)

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│  📊 DOANH THU THEO CƠ SỞ             │  📈 TĂNG TRƯỞNG HỌC SINH              │
│  (Bar chart - 12 tháng gần nhất)     │  (Line chart - 6 tháng)               │
│                                       │                                       │
│  Q7:  ████████ ₫182M                 │  1400 ─────────────────────── •       │
│  BT:  ██████ ₫156M                   │  1200 ───────────────── •             │
│  TĐ:  █████ ₫147M                    │  1000 ─────────── •                   │
│                                       │   800 ────── •                        │
│  [Filter: Tháng ▼] [vs Cùng kỳ ▼]   │  [Filter: Campus ▼]                  │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### Alerts & AI Insights (Row 3)

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│  🚨 CẢNH BÁO CẦN XỬ LÝ              │  🤖 AI INSIGHTS                        │
│                                       │                                       │
│  🔴 Campus Q7: 42 HS công nợ >30 ngày│  📉 Dự báo: Doanh thu T10 có thể      │
│      ₫ 126M chưa thu được             │      giảm 18% nếu không mở thêm lớp   │
│      [Xử lý ngay →]                  │      tại Campus Thủ Đức.              │
│                                       │      [Xem phân tích →]               │
│  🟠 Campus BT: Lớp Toán 10A đang có  │                                       │
│      chỉ 8/15 HS → nguy cơ đóng lớp  │  ⚠️ 34 học sinh có pattern nghỉ học   │
│      [Xem lớp →]                     │      bất thường — cần tư vấn sớm.     │
│                                       │      [Xem danh sách →]               │
│  🟡 3 GV sắp hết hợp đồng trong 30   │                                       │
│      ngày — cần gia hạn hoặc tuyển   │  💡 Gợi ý: Mở thêm 2 lớp Tiếng Anh  │
│      [Xem HRM →]                     │      tại Campus Q7 — demand cao       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### Multi-Campus Overview (Row 4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏫 TỔNG QUAN CƠ SỞ                                                        │
│                                                                             │
│  Campus      │ Học sinh │ Doanh thu T này │ Tỷ lệ điểm danh │ Tình trạng  │
│  ────────────┼──────────┼─────────────────┼─────────────────┼──────────── │
│  Q7          │   487    │ ₫ 182M          │ 92%             │ 🟢 Tốt      │
│  Bình Thạnh  │   412    │ ₫ 156M          │ 88%             │ 🟡 Ổn       │
│  Thủ Đức     │   348    │ ₫ 147M          │ 85%             │ 🟡 Ổn       │
│  [Xem tất cả cơ sở →]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard — Hiệu Trưởng (Principal)

**Scope:** Cơ sở được phân công  
**Mục tiêu:** Nắm tình hình vận hành campus hàng ngày

### KPI Cards

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  📚 Lớp học  │  👥 Điểm danh│  👩‍🏫 GV hôm  │  ⚠️ TKB      │  💰 Thu học  │
│  Đang hoạt   │  Hôm nay     │  nay         │  Conflicts   │  phí T này   │
│              │              │              │              │              │
│  24 lớp      │  891 / 950   │  18 có mặt   │  0           │  ₫ 156M      │
│  3 sắp đủ HS │  94% ✅      │  2 vắng ❌   │  ✅ OK        │  87% target  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Main Content

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│  📅 LỊCH HÔM NAY                     │  ⚠️ CẦN CHÚ Ý                         │
│  Thứ Tư, 04/07/2026                  │                                       │
│                                       │  🔴 Lê Thị B (GV Lý) vắng đột xuất  │
│  07:00 Tiết 1 bắt đầu               │      → Đã tự động notify GV dự phòng  │
│  Đang học: 18/24 lớp                 │      [Xác nhận thay thế →]           │
│                                       │                                       │
│  09:30 Họp BGH (phòng 201)          │  🟠 Lớp 9B: 4 HS vắng 2 tuần liên tiếp│
│  Tham dự: Bạn, 3 trưởng bộ môn      │      → AI: Cần liên hệ phụ huynh     │
│                                       │      [Xem chi tiết →]               │
│  14:00 Kiểm tra lớp 10A1            │                                       │
│                                       │  🟡 Phòng Lab A bảo trì ngày mai     │
│  [Xem toàn bộ lịch →]               │      → 3 lớp có tiết tại đây         │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### Student Progress This Week

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 HỌC SINH TIẾN BỘ / GIẢM SÚT TUẦN NÀY (AI Analysis)                    │
│                                                                             │
│  ✅ Tiến bộ tốt (Top 5):                                                    │
│     Nguyễn Văn A (10A1) — điểm KT tăng 2.5 điểm                          │
│     ...                                                                     │
│                                                                             │
│  ⚠️ Cần theo dõi (5 HS):                                                    │
│     Trần Thị B (11B2) — vắng 3 buổi, điểm giảm                           │
│     ...                                                                     │
│  [Xem tất cả →]                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard — Trưởng Bộ Môn (Department Head)

**Scope:** Bộ môn phụ trách  
**Mục tiêu:** Chất lượng giảng dạy và tiến độ chương trình

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Lớp BM      │  GV BM       │  Tiến độ     │  KPI GV      │
│  phụ trách   │  hôm nay     │  CT trung    │  trung bình  │
│  12 lớp      │  8/9 GV      │  bình        │  Quý này     │
│              │              │  78%         │  8.2/10      │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌───────────────────────────────────────────────────────────┐
│  📊 TIẾN ĐỘ CHƯƠNG TRÌNH THEO LỚP                         │
│  Lớp    │ Giáo viên    │ Tiến độ  │ Bài KT gần nhất      │
│  10A1   │ Nguyễn A     │ ██████ 82% │ TB: 7.5 (Tốt)      │
│  10A2   │ Trần B       │ █████ 71% │ TB: 6.8 (Cần xem)  │
│  11B1   │ Lê C         │ ████████ 90% │ TB: 8.1 (Tốt)   │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Dashboard — Giáo Viên (Teacher)

**Scope:** Lớp học được phân công  
**Mục tiêu:** Quản lý lớp học hiệu quả hàng ngày

### Layout Teacher Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Xin chào, Nguyễn Văn Anh! Hôm nay: Thứ Tư, 04/07/2026                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 LỊCH DẠY HÔM NAY                      📋 CẦN LÀM NGAY                 │
│  ──────────────────────────                ────────────────────────────    │
│  07:00 Tiết 1 — Lớp 10A1 (Toán)           ❌ Điểm danh Tiết 1/10A1        │
│       Phòng: 201 — 15/15 HS               ❌ Điểm danh Tiết 3/11B2        │
│                                            📝 3 bài tập chưa chấm điểm    │
│  09:30 Tiết 3 — Lớp 11B2 (Đại số)        📌 KPI review deadline: T6       │
│       Phòng: 305 — 18/20 HS               [Làm ngay →]                   │
│                                                                             │
│  14:30 Tiết 5 — Lớp 12C1 (Giải tích)                                     │
│       Phòng: 102 — 22/22 HS                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 ĐIỂM DANH TUẦN NÀY (Lớp 10A1)        🏆 TOP STUDENTS TUẦN NÀY         │
│  ──────────────────────────────           ─────────────────────────────   │
│  T2: 14/15 ✅  T3: 15/15 ✅               1. Nguyễn Anh — 98%             │
│  T4: Chờ...   T5: -  T6: -               2. Trần Mai — 95%               │
│                                           3. Lê Hùng — 93%               │
│  Vắng nhiều: Phạm Bảo (3 buổi)                                            │
│  [Xem chi tiết →]  [Liên hệ PH →]        [Xem tất cả →]                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Quick Actions

```
[✅ Điểm danh nhanh] [📝 Thêm bài KT] [💬 Nhắn PH] [📊 Xem tiến độ lớp]
```

---

## 5. Dashboard — Học Sinh (Student)

**Scope:** Bản thân  
**Mục tiêu:** Theo dõi học tập và tham gia tích cực

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  👋 Chào Nguyễn Minh An! Level 12 🌟  [XP: 2,450 / 3,000 lên Level 13]   │
│  ████████████████████░░░░  82%                                             │
├──────────────────────────┬─────────────────────────────────────────────────┤
│  📅 LỊCH HỌC HÔM NAY     │  🎯 MISSIONS                                    │
│                          │                                                  │
│  07:00 Toán — P.201      │  ✅ Hoàn thành: Điểm danh 5 buổi liên tiếp     │
│  09:30 Lý — P.305        │  🔲 Đang làm: Nộp bài tập Toán                 │
│  14:30 Anh văn — P.102   │  🔲 Sắp tới: Ôn tập cho KT Lý ngày T6         │
│                          │  [Xem tất cả missions →]                        │
├──────────────────────────┼─────────────────────────────────────────────────┤
│  📊 TIẾN ĐỘ HỌC TẬP     │  📣 THÔNG BÁO                                   │
│                          │                                                  │
│  Toán: ████████ 85%      │  📌 Lịch kiểm tra Lý: Thứ 6, 07:00            │
│  Lý:   ██████ 72%        │  📌 Nghỉ lễ 30/4: 29/04 — 01/05               │
│  Anh:  ████████ 88%      │  📌 Kết quả KT Toán: 8.5 điểm 🎉              │
│                          │                                                  │
│  Điểm danh: 94%          │                                                  │
│  Bài tập: 89%            │                                                  │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 6. Dashboard — Phụ Huynh (Parent)

**Scope:** Con cái được link  
**Mục tiêu:** Theo dõi con và tương tác với trường

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  👨‍👩‍👦 Xin chào! Theo dõi: Nguyễn Minh An (Lớp 10A1 — AvaB Q7)            │
├──────────────────────────────────┬──────────────────────────────────────────┤
│  📅 ĐIỂM DANH TUẦN NÀY          │  💰 HỌC PHÍ                              │
│                                  │                                          │
│  T2 ✅  T3 ✅  T4 ✅  T5 ✅  T6 — │  Hóa đơn T7: ₫ 2,800,000               │
│  Tỷ lệ tháng này: 94%            │  Đến hạn: 15/07/2026                    │
│                                  │  Trạng thái: ⏳ Chưa thanh toán          │
│                                  │  [Thanh toán ngay →]                    │
├──────────────────────────────────┼──────────────────────────────────────────┤
│  📊 TIẾN ĐỘ HỌC TẬP            │  📣 THÔNG BÁO TỪ TRƯỜNG                  │
│                                  │                                          │
│  Toán: 8.5/10 ▲                  │  📌 An đã vắng mặt tiết Lý thứ 4       │
│  Lý:   7.2/10 ▼ (cần chú ý)     │      Lý do: Chưa có                     │
│  Anh:  8.8/10 ▲                  │      [Gửi lý do →]                      │
│                                  │                                          │
│  Xếp hạng lớp: Top 30%          │  📌 KT Lý vào Thứ 6, 07:00             │
│  [Chi tiết học tập →]            │      Ôn chương 3-5                      │
├──────────────────────────────────┴──────────────────────────────────────────┤
│  💬 NHẮN TIN VỚI GIÁO VIÊN                                                  │
│  [Nhắn GV chủ nhiệm] [Nhắn GV Lý] [Nhắn GV Anh]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Dashboard — Finance Staff (Kế Toán)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Doanh thu T7 │ Đã thu       │ Còn lại       │ Quá hạn      │
│ ₫ 156M       │ ₫ 134M (86%) │ ₫ 22M (14%)  │ ₫ 8.4M ⚠️   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌───────────────────────────────┬───────────────────────────────┐
│  📋 HÓA ĐƠN CẦN XỬ LÝ       │  💳 THANH TOÁN GẦN ĐÂY        │
│                               │                               │
│  🔴 Quá hạn >30 ngày: 14 HĐ  │  10:32 Nguyễn A — ₫2.8M ✅  │
│  🟠 Đến hạn hôm nay: 8 HĐ   │  09:15 Trần B — ₫3.2M ✅    │
│  🟡 Đến hạn tuần này: 23 HĐ  │  08:45 Lê C — ₫1.5M ✅      │
│                               │                               │
│  [Xử lý tất cả →]            │  [Xem tất cả →]              │
└───────────────────────────────┴───────────────────────────────┘
```

---

## 8. Dashboard — Sales / Tư Vấn Viên

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Leads của tôi│ Liên hệ hôm  │ Trial tuần   │ Đã chốt T7  │
│ 28 leads     │ nay: 5       │ này: 3       │ 4 HS ✅      │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌───────────────────────────────────────────────────────────┐
│  📋 PIPELINE CỦA TÔI (Kanban mini)                         │
│                                                           │
│  New(3) → Contacted(8) → Trial(4) → Enrolled(4) → ...   │
│  [Xem pipeline đầy đủ →]                                  │
│                                                           │
│  🔴 Cần follow-up ngay (>3 ngày chưa liên hệ):           │
│     Phạm Thị Lan — Lead Q7 — SĐT: 09x... — [Gọi ngay]   │
│     Võ Minh Tuấn — Lead BT — SĐT: 09x... — [Gọi ngay]   │
└───────────────────────────────────────────────────────────┘
```

---

## 9. Widget Architecture (Technical)

Mỗi dashboard được compose từ **widgets** — các components độc lập:

```typescript
// Widget registry
const widgetMap: Record<Role, Widget[]> = {
  org_owner: [
    'kpi-revenue', 'kpi-students', 'kpi-renewal-rate', 'kpi-cashflow',
    'chart-revenue-by-campus', 'chart-student-growth',
    'alert-list', 'ai-insights',
    'multi-campus-table'
  ],
  principal: [
    'kpi-classes', 'kpi-attendance-today', 'kpi-teacher-presence',
    'kpi-timetable-conflicts', 'today-schedule', 'alerts',
    'student-progress-summary'
  ],
  teacher: [
    'today-lessons', 'quick-attendance', 'todo-list',
    'class-attendance-summary', 'top-students'
  ],
  student: [
    'today-schedule', 'xp-progress', 'missions',
    'subject-progress', 'notifications'
  ],
  parent: [
    'child-attendance', 'invoice-status', 'subject-progress',
    'school-notifications', 'teacher-chat'
  ]
};

// Widget data fetching (React Query / SWR)
interface Widget {
  id: string;
  component: React.ComponentType;
  dataFetcher: () => Promise<unknown>;
  refreshInterval?: number; // ms
  permission: string;
}
```

---

*Document prepared by AvaB Architecture Team — 2026-07-04*
