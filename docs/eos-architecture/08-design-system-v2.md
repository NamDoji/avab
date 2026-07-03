# AvaB EOS v2.0 — Design System v2 (Hệ thống Thiết kế)

> **Date:** 2026-07-04  
> **Version:** 2.0  
> **Status:** Architecture Planning

---

## 1. Design Philosophy

AvaB EOS v2 Design System được xây dựng trên 4 nguyên tắc cốt lõi:

1. **Clarity First** — Mỗi element phải rõ ràng mục đích và hành động
2. **Module Identity** — Mỗi module có màu sắc riêng để navigate nhanh
3. **Progressive Disclosure** — Hiển thị thông tin theo cấp độ, không overwhelm
4. **AI-Augmented** — Thiết kế có chỗ cho AI insights một cách tự nhiên

---

## 2. Color Tokens — Theo Module

### 2.1 Base Colors

```css
/* Brand */
--color-brand-primary: #2D5BE3;      /* AvaB Blue */
--color-brand-secondary: #1A3A8F;    /* Deep Blue */
--color-brand-accent: #5B8EFF;       /* Light Blue */

/* Neutral */
--color-neutral-50:  #F9FAFB;
--color-neutral-100: #F3F4F6;
--color-neutral-200: #E5E7EB;
--color-neutral-300: #D1D5DB;
--color-neutral-400: #9CA3AF;
--color-neutral-500: #6B7280;
--color-neutral-600: #4B5563;
--color-neutral-700: #374151;
--color-neutral-800: #1F2937;
--color-neutral-900: #111827;

/* Semantic */
--color-success-50:  #F0FDF4;
--color-success-500: #22C55E;
--color-success-700: #15803D;

--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-700: #B45309;

--color-error-50:    #FEF2F2;
--color-error-500:   #EF4444;
--color-error-700:   #B91C1C;

--color-info-50:     #EFF6FF;
--color-info-500:    #3B82F6;
--color-info-700:    #1D4ED8;
```

### 2.2 Module Color Tokens

| Module | Primary | Background | Border | Icon | Dark Mode Primary |
|--------|---------|-----------|--------|------|-------------------|
| **School ERP** | `#1565C0` | `#EFF6FF` | `#BFDBFE` | 📚 | `#3B82F6` |
| **Finance ERP** | `#166534` | `#F0FDF4` | `#BBF7D0` | 💰 | `#22C55E` |
| **CRM** | `#C2410C` | `#FFF7ED` | `#FED7AA` | 📞 | `#F97316` |
| **HRM** | `#6B21A8` | `#FAF5FF` | `#E9D5FF` | 👔 | `#A855F7` |
| **Collaboration** | `#0F766E` | `#F0FDFA` | `#99F6E4` | 🤝 | `#2DD4BF` |
| **Analytics** | `#1D4ED8` | `#EFF6FF` | `#BFDBFE` | 📈 | `#60A5FA` |
| **AI Decision** | `#4C1D95` | `#F5F3FF` | `#DDD6FE` | 🤖 | `#8B5CF6` |
| **AI Timetable** | `#831843` | `#FFF1F2` | `#FECDD3` | 🕐 | `#F43F5E` |
| **App Center** | `#0C4A6E` | `#F0F9FF` | `#BAE6FD` | 🔌 | `#38BDF8` |

```css
/* Example: School ERP tokens */
--erp-primary:   #1565C0;
--erp-bg:        #EFF6FF;
--erp-border:    #BFDBFE;
--erp-text:      #1E40AF;
--erp-hover:     #1D4ED8;
--erp-active:    #1E3A8A;

/* Usage */
.module-badge--erp {
  background: var(--erp-bg);
  border: 1px solid var(--erp-border);
  color: var(--erp-primary);
}
```

### 2.3 Semantic Status Colors

```css
/* Attendance Status */
--attendance-present: #22C55E;    /* ✅ Có mặt */
--attendance-absent:  #EF4444;    /* ❌ Vắng không phép */
--attendance-late:    #F59E0B;    /* ⚠️ Đi trễ */
--attendance-excuse:  #6B7280;    /* 🔘 Có phép */

/* Invoice Status */
--invoice-paid:       #22C55E;    /* ✅ Đã thanh toán */
--invoice-pending:    #F59E0B;    /* ⏳ Chờ thanh toán */
--invoice-overdue:    #EF4444;    /* 🔴 Quá hạn */
--invoice-partial:    #3B82F6;    /* 🔵 Đã TT một phần */
--invoice-refunded:   #8B5CF6;    /* 💜 Đã hoàn */

/* Lead CRM Stages */
--lead-new:           #6B7280;
--lead-contacted:     #3B82F6;
--lead-trial:         #F59E0B;
--lead-enrolled:      #22C55E;
--lead-lost:          #EF4444;
--lead-alumni:        #8B5CF6;

/* Alert Priority */
--alert-critical:     #DC2626;
--alert-high:         #EA580C;
--alert-medium:       #CA8A04;
--alert-info:         #2563EB;
```

---

## 3. Typography Scale

### 3.1 Font Families

```css
/* Primary: Content & UI */
--font-sans: 'Inter', 'Be Vietnam Pro', system-ui, sans-serif;

/* Mono: Code, IDs, numbers */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display: Headings, marketing */
--font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
```

### 3.2 Type Scale

```css
/* Display */
--text-display-2xl: { font-size: 4.5rem;  line-height: 1.1; letter-spacing: -0.02em; font-weight: 700; }
--text-display-xl:  { font-size: 3.75rem; line-height: 1.1; letter-spacing: -0.02em; font-weight: 700; }
--text-display-lg:  { font-size: 3rem;    line-height: 1.2; letter-spacing: -0.01em; font-weight: 700; }

/* Headings */
--text-h1:  { font-size: 2.25rem; line-height: 1.3; font-weight: 700; }  /* 36px */
--text-h2:  { font-size: 1.875rem; line-height: 1.3; font-weight: 600; } /* 30px */
--text-h3:  { font-size: 1.5rem;  line-height: 1.4; font-weight: 600; } /* 24px */
--text-h4:  { font-size: 1.25rem; line-height: 1.4; font-weight: 600; } /* 20px */
--text-h5:  { font-size: 1.125rem; line-height: 1.5; font-weight: 600; }/* 18px */
--text-h6:  { font-size: 1rem;    line-height: 1.5; font-weight: 600; } /* 16px */

/* Body */
--text-xl:  { font-size: 1.25rem; line-height: 1.75; }  /* 20px */
--text-lg:  { font-size: 1.125rem; line-height: 1.75; } /* 18px */
--text-base: { font-size: 1rem;   line-height: 1.5; }   /* 16px — default */
--text-sm:  { font-size: 0.875rem; line-height: 1.5; }  /* 14px */
--text-xs:  { font-size: 0.75rem;  line-height: 1.5; }  /* 12px */
--text-2xs: { font-size: 0.625rem; line-height: 1.5; }  /* 10px — labels only */
```

### 3.3 Usage Guidelines

```
Page Title (h1):       font-display, 30-36px, font-weight: 700
Section Heading (h2):  font-sans, 24px, font-weight: 600
Card Title (h3):       font-sans, 18-20px, font-weight: 600
Label:                 font-sans, 12-14px, font-weight: 500, uppercase + tracking
Body Text:             font-sans, 14-16px, font-weight: 400
Caption:               font-sans, 12px, color: neutral-500
Monospace (IDs):       font-mono, 12-14px
Numbers (KPIs):        font-display, 24-48px, font-weight: 700, tabular-nums
```

---

## 4. Component Inventory

### 4.1 Atoms (Base Components)

```
Buttons:
  - Button (primary, secondary, ghost, danger, link)
  - IconButton (icon only, với tooltip)
  - ButtonGroup (grouped actions)

Inputs:
  - TextInput (với label, error, hint)
  - Textarea
  - Select / Combobox (searchable)
  - MultiSelect
  - DatePicker / DateRangePicker
  - TimePicker
  - NumberInput (currency formatting)
  - PhoneInput (VN format)
  - SearchInput (với debounce)
  - FileUpload (drag & drop)

Display:
  - Badge (status, count, module)
  - Tag / Chip (removable)
  - Avatar (user, with fallback initials)
  - AvatarGroup (stacked avatars)
  - Spinner / LoadingDots
  - Skeleton (loading placeholder)
  - Divider
  - Tooltip (hover info)
  - Kbd (keyboard shortcuts)
```

### 4.2 Molecules (Composed Components)

```
Navigation:
  - SideNavItem (icon + label + badge)
  - SideNavGroup (collapsible section)
  - Breadcrumb (với overflow handling)
  - TabList / Tab
  - Pagination

Feedback:
  - Alert (critical, high, medium, info)
  - Toast (tự dismiss sau 5s)
  - EmptyState (icon + title + description + CTA)
  - ConfirmDialog (destructive actions)
  - ProgressBar

Data:
  - KPICard (metric + trend + sparkline)
  - StatCard (simple stat display)
  - InfoRow (label: value pairs)
  - Timeline (activity log)

Forms:
  - FormField (label + input + error + hint)
  - FormSection (grouped fields)
  - FilterBar (search + filters + active chips)
  - SearchCombobox (search + dropdown)
```

### 4.3 Organisms (Complex Components)

```
Tables:
  - DataTable (sort, filter, pagination, row select)
  - VirtualTable (large datasets 10k+ rows)
  - MobileTable (card view fallback)

Lists:
  - StudentList (avatar + name + class + status)
  - LeadList (với stage indicator)
  - InvoiceList (với payment status)

Cards:
  - CampusCard (stats + status)
  - StudentCard (profile summary)
  - LeadCard (Kanban card)
  - AlertCard (AI decision center)

Dashboard:
  - DashboardGrid (responsive widget grid)
  - Widget (base wrapper: title + loading + error states)
  - ChartWidget (Recharts/Chart.js wrapper)
  - TableWidget (embedded table)

Complex:
  - TimetableGrid (week view, drag & drop)
  - KanbanBoard (drag & drop stages)
  - CalendarView (month/week/day)
  - FileManager
  - RichTextEditor (Tiptap/ProseMirror)
  - CommandPalette (cmd+K global search)
```

### 4.4 Layouts

```
- AdminShell (side nav + top bar + content)
- PageLayout (header + main + optional sidebar)
- SplitLayout (list + detail, responsive)
- FormLayout (single column / two column)
- ModalLayout (fullscreen on mobile)
- PrintLayout (for invoice/report print)
```

---

## 5. Icon Set Per Module

Sử dụng **Lucide React** (open source) + custom icons cho AvaB-specific:

```
Navigation Icons:
  LayoutDashboard    Dashboard
  GraduationCap      School ERP
  DollarSign         Finance ERP
  Phone              CRM
  Users              HRM
  Calendar           Collaboration
  BarChart3          Analytics
  Brain              AI Decision Center
  Clock              AI Timetable
  AppWindow          App Center

School ERP Icons:
  UserRound          Student
  BookOpen           Teacher / Class
  DoorOpen           Room
  Cpu                Equipment
  CheckSquare        Attendance
  Award              Rewards
  Heart              Health
  GraduationCap      Alumni

Finance Icons:
  Receipt            Invoice
  CreditCard         Payment
  Gift               Voucher
  Percent            Scholarship
  CalendarDays       Installment
  TrendingUp         Revenue
  RefreshCcw         Refund

CRM Icons:
  UserPlus           New Lead
  PhoneCall          Contacted
  Play               Trial
  UserCheck          Enrolled
  RotateCcw          Renewal
  Megaphone          Campaign

Action Icons:
  Plus               Add / Create
  Pencil             Edit
  Trash2             Delete
  Download           Export
  Upload             Import
  Search             Search
  Filter             Filter
  ChevronDown        Dropdown
  ArrowRight         Navigate
  ExternalLink       Open in new
  Copy               Copy
  Share2             Share
  MoreHorizontal     More actions (3 dots)
  Bell               Notifications
  Settings           Settings
  LogOut             Logout
  X                  Close / Remove
  Check              Success / Confirm
  AlertTriangle      Warning
  Info               Info
  AlertCircle        Error

AI Icons (custom):
  Sparkles           AI feature
  Zap                AI quick action
  Bot                AI assistant
  TrendingUp         Prediction
  Lightbulb          Recommendation
```

---

## 6. Animation Principles

### 6.1 Duration Scale

```css
--duration-instant:  0ms;     /* Immediate feedback */
--duration-fast:     100ms;   /* Hover states, small toggles */
--duration-normal:   200ms;   /* Dropdowns, tooltips, tabs */
--duration-slow:     300ms;   /* Modals, sidesheets, page transitions */
--duration-slower:   500ms;   /* Skeleton loading reveals */
```

### 6.2 Easing Functions

```css
--ease-default:   cubic-bezier(0.4, 0, 0.2, 1);   /* Material ease */
--ease-in:        cubic-bezier(0.4, 0, 1, 1);      /* Accelerate */
--ease-out:       cubic-bezier(0, 0, 0.2, 1);      /* Decelerate (most common) */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Springy, for delight */
--ease-linear:    linear;                           /* Progress bars only */
```

### 6.3 Motion Patterns

```
Microinteractions:
  Button press:    scale(0.97) — 100ms
  Card hover:      translateY(-2px) + shadow — 200ms ease-out
  Checkbox check:  path animation — 200ms ease-spring
  Toggle switch:   translateX — 200ms ease-spring

Entrances:
  Dropdown:        opacity 0→1 + translateY(-4px→0) — 200ms ease-out
  Modal:           opacity 0→1 + scale(0.97→1) — 300ms ease-out
  Toast:           slideInRight — 300ms ease-out
  Page:            opacity 0→1 — 200ms

Loading:
  Skeleton:        animated gradient shimmer
  Spinner:         rotate 360° — 600ms linear infinite
  Progress:        width animate — linear

AI Generation:
  "Thinking" state: pulsing gradient on AI elements
  Result reveal:   typewriter effect for text
  Chart animate:   bars grow from 0 — 500ms staggered
```

### 6.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .skeleton { animation: none; background: var(--color-neutral-200); }
}
```

---

## 7. Dark Mode Strategy

### 7.1 Approach

- **System-follows:** Default theo OS preference
- **Manual toggle:** User có thể override
- **Persistence:** Lưu vào user preferences
- **CSS Variables:** Token-based, switch bằng `[data-theme="dark"]`

### 7.2 Dark Mode Tokens

```css
:root {
  --bg-base:         #FFFFFF;
  --bg-subtle:       #F9FAFB;
  --bg-muted:        #F3F4F6;
  --bg-emphasis:     #E5E7EB;
  --text-primary:    #111827;
  --text-secondary:  #4B5563;
  --text-muted:      #9CA3AF;
  --border-default:  #E5E7EB;
  --border-strong:   #D1D5DB;
  --shadow-sm:       0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:       0 4px 6px rgba(0,0,0,0.07);
}

[data-theme="dark"] {
  --bg-base:         #0F172A;
  --bg-subtle:       #1E293B;
  --bg-muted:        #334155;
  --bg-emphasis:     #475569;
  --text-primary:    #F1F5F9;
  --text-secondary:  #CBD5E1;
  --text-muted:      #64748B;
  --border-default:  #1E293B;
  --border-strong:   #334155;
  --shadow-sm:       0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:       0 4px 6px rgba(0,0,0,0.4);
}
```

### 7.3 Module Colors in Dark Mode

```css
[data-theme="dark"] {
  /* Module backgrounds are darker, text/borders lighter */
  --erp-bg:     #172554;
  --erp-border: #1D4ED8;
  --erp-text:   #93C5FD;

  --finance-bg:    #052E16;
  --finance-border:#15803D;
  --finance-text:  #86EFAC;

  /* etc. for all modules */
}
```

---

## 8. Mobile-First Breakpoints

### 8.1 Breakpoint System

```css
/* Mobile-first (min-width) */
--bp-xs:   320px;   /* Smallest phones */
--bp-sm:   375px;   /* iPhone standard */
--bp-md:   768px;   /* Tablet portrait */
--bp-lg:   1024px;  /* Tablet landscape / small laptop */
--bp-xl:   1280px;  /* Desktop */
--bp-2xl:  1536px;  /* Large desktop */
--bp-3xl:  1920px;  /* Wide screen */

/* Tailwind equivalent */
sm:   @media (min-width: 640px)
md:   @media (min-width: 768px)
lg:   @media (min-width: 1024px)
xl:   @media (min-width: 1280px)
2xl:  @media (min-width: 1536px)
```

### 8.2 Layout Grid

```css
/* Mobile: 4 columns, 16px gutter */
/* Tablet: 8 columns, 24px gutter */
/* Desktop: 12 columns, 32px gutter */

.container {
  width: 100%;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .container { padding: 0 24px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1440px; margin: 0 auto; padding: 0 32px; }
}
```

### 8.3 Component Responsive Behavior

```
Component          Mobile               Tablet              Desktop
─────────────────────────────────────────────────────────────────────
Side Nav           Bottom tab (5 items) Icon only (collapsed) Full (expanded)
Data Table         Card list view       Scrollable table     Full table
KPI Cards          2-col grid           4-col grid           4-col grid
Charts             Full width, simple   Two charts/row       Flexible grid
Kanban Board       Vertical list        Scroll horizontal    Full board
Modal              Full screen          Center, max 80vh     Center, max 600px
Filters            Bottom sheet        Dropdown bar         Sidebar
Actions            FAB (floating)       Inline buttons       Inline buttons
```

---

## 9. Spacing & Sizing Tokens

```css
/* Base: 4px grid */
--space-px:   1px;
--space-0.5:  2px;
--space-1:    4px;
--space-1.5:  6px;
--space-2:    8px;
--space-2.5:  10px;
--space-3:    12px;
--space-4:    16px;   /* Base spacing unit */
--space-5:    20px;
--space-6:    24px;
--space-8:    32px;
--space-10:   40px;
--space-12:   48px;
--space-16:   64px;
--space-20:   80px;
--space-24:   96px;

/* Border Radius */
--radius-sm:   4px;   /* Tags, badges */
--radius-md:   6px;   /* Inputs, buttons */
--radius-lg:   8px;   /* Cards */
--radius-xl:   12px;  /* Modals */
--radius-2xl:  16px;  /* Large cards */
--radius-full: 9999px; /* Pills, avatars */

/* Shadows */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.04);
--shadow-sm:  0 2px 4px rgba(0,0,0,0.06);
--shadow-md:  0 4px 8px rgba(0,0,0,0.08);
--shadow-lg:  0 8px 16px rgba(0,0,0,0.10);
--shadow-xl:  0 16px 32px rgba(0,0,0,0.12);
--shadow-2xl: 0 24px 48px rgba(0,0,0,0.15);
```

---

## 10. Design Tokens — Xuất ra Các Format

```
Design token sources:
  design-tokens/
  ├── primitives.json    ← Raw values (colors, spacing, etc.)
  ├── semantic.json      ← Purpose-based tokens
  ├── module.json        ← Per-module tokens
  └── component.json     ← Component-specific tokens

Build output:
  ├── tokens.css         ← CSS custom properties
  ├── tokens.js          ← JavaScript object (for Tailwind / JS usage)
  ├── tokens.scss        ← SCSS variables
  └── tokens.figma.json  ← Figma Tokens plugin import
```

---

## 11. Accessibility Guidelines

```
Color Contrast:
  Body text on white: ≥ 4.5:1 (WCAG AA)
  Large text on white: ≥ 3:1
  Interactive elements: ≥ 3:1

Keyboard Navigation:
  All interactive elements focusable with Tab
  Focus ring: 2px solid --color-brand-primary, offset 2px
  Skip link: "Skip to main content"

Screen Reader:
  All images: alt text required
  Icons: aria-label khi icon-only
  Form inputs: label liên kết với htmlFor
  Tables: thead với scope="col"
  Live regions: aria-live="polite" cho toast/alerts

Touch Targets:
  Minimum: 44×44px (iOS HIG), 48×48dp (Material)
  Spacing between targets: ≥ 8px
```

---

*Document prepared by AvaB Architecture Team — 2026-07-04*
