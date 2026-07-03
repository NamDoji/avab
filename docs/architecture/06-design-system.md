# AvaB V1.0 — Design System

> **Ngày tạo:** 2026-07-04  
> **Phiên bản:** 1.0  
> **Trạng thái:** Draft  
> **Cảm hứng:** Canva, Notion, Figma — Action-first, Clean, Educational

---

## 1. Triết lý thiết kế

### Nguyên tắc cốt lõi
1. **Action-first:** Hành động quan trọng nhất luôn rõ ràng và dễ tiếp cận
2. **Content-forward:** Nội dung học tập là trung tâm, UI là nền
3. **Progressive disclosure:** Hiển thị đơn giản trước, phức tạp khi cần
4. **Inclusive by default:** Thiết kế cho mọi người, kể cả người học chậm
5. **Delightful learning:** Vui vẻ, có reward, không căng thẳng

---

## 2. Color Palette

### 2.1 Primary Colors (AvaB Brand)

```css
--color-primary-50:  #EEF2FF;
--color-primary-100: #E0E7FF;
--color-primary-200: #C7D2FE;
--color-primary-300: #A5B4FC;
--color-primary-400: #818CF8;
--color-primary-500: #6366F1;  /* Primary base */
--color-primary-600: #4F46E5;  /* Primary dark (CTAs) */
--color-primary-700: #4338CA;
--color-primary-800: #3730A3;
--color-primary-900: #312E81;
```

**Sử dụng:**
- `primary-600`: CTA buttons, links, active states
- `primary-500`: Hover states, accents
- `primary-100`: Backgrounds, chips, tags

### 2.2 Secondary Colors (Accent / Warm)

```css
--color-secondary-50:  #FFF7ED;
--color-secondary-100: #FFEDD5;
--color-secondary-200: #FED7AA;
--color-secondary-300: #FDBA74;
--color-secondary-400: #FB923C;
--color-secondary-500: #F97316;  /* Secondary base */
--color-secondary-600: #EA580C;
--color-secondary-700: #C2410C;
--color-secondary-800: #9A3412;
--color-secondary-900: #7C2D12;
```

**Sử dụng:**
- `secondary-500`: AI features, creative actions, gamification
- `secondary-100`: AI Studio backgrounds

### 2.3 Neutral Colors (Slate)

```css
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
--color-neutral-950: #020617;
```

### 2.4 Semantic Colors

```css
/* Success (Green) */
--color-success-50:  #F0FDF4;
--color-success-500: #22C55E;
--color-success-600: #16A34A;
--color-success-700: #15803D;

/* Warning (Amber) */
--color-warning-50:  #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-600: #D97706;

/* Error (Red) */
--color-error-50:  #FEF2F2;
--color-error-500: #EF4444;
--color-error-600: #DC2626;

/* Info (Blue) */
--color-info-50:  #EFF6FF;
--color-info-500: #3B82F6;
--color-info-600: #2563EB;
```

### 2.5 Subject Colors (màu nhận diện từng môn)

```css
--color-subject-math:    #4F46E5;  /* Indigo - Toán */
--color-subject-lit:     #DC2626;  /* Red - Văn */
--color-subject-english: #2563EB;  /* Blue - Tiếng Anh */
--color-subject-science: #16A34A;  /* Green - KHTN/Lý/Hóa/Sinh */
--color-subject-history: #D97706;  /* Amber - Lịch sử/Địa */
--color-subject-art:     #9333EA;  /* Purple - Nghệ thuật */
--color-subject-pe:      #0891B2;  /* Cyan - Thể dục */
--color-subject-it:      #0F172A;  /* Dark - Tin học */
```

---

## 3. Typography

### 3.1 Font Family

```css
/* Heading - Display text */
--font-display: 'Inter', 'SVN-Gilroy', sans-serif;

/* Body - Reading text */
--font-body: 'Inter', 'Be Vietnam Pro', sans-serif;

/* Monospace - Code, technical */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Vietnamese support note: Be Vietnam Pro là fallback tốt cho tiếng Việt */
```

### 3.2 Type Scale (rem, base = 16px)

| Token | Size | Px | Weight | Line Height | Dùng cho |
|-------|------|----|--------|-------------|----------|
| `text-xs` | 0.75rem | 12px | 400 | 1.5 | Captions, labels nhỏ |
| `text-sm` | 0.875rem | 14px | 400 | 1.5 | Secondary text, badges |
| `text-base` | 1rem | 16px | 400 | 1.6 | Body text chính |
| `text-lg` | 1.125rem | 18px | 500 | 1.5 | Sub-headings, lead |
| `text-xl` | 1.25rem | 20px | 600 | 1.4 | Section titles |
| `text-2xl` | 1.5rem | 24px | 600 | 1.3 | Card headings, H3 |
| `text-3xl` | 1.875rem | 30px | 700 | 1.2 | Page headings, H2 |
| `text-4xl` | 2.25rem | 36px | 700 | 1.2 | Hero headings, H1 |
| `text-5xl` | 3rem | 48px | 800 | 1.1 | Landing page hero |
| `text-6xl` | 3.75rem | 60px | 800 | 1.0 | Display/Marketing |

### 3.3 Font Weight

```css
--font-normal:    400;  /* Body text */
--font-medium:    500;  /* Subheadings, emphasis */
--font-semibold:  600;  /* Buttons, labels */
--font-bold:      700;  /* Headings */
--font-extrabold: 800;  /* Hero, display */
```

### 3.4 Vietnamese Typography Notes

- Dùng `font-feature-settings: "kern" 1` để cải thiện kerning tiếng Việt
- `word-break: break-word` cho text dài trong card
- Không dùng `text-transform: uppercase` với tiếng Việt (dấu sẽ bị mất)
- Font size tối thiểu trên mobile: 14px cho body, 12px cho labels

---

## 4. Spacing Scale (4px base)

```css
--space-0:   0;
--space-0.5: 2px;    /* 0.5 */
--space-1:   4px;    /* 1 */
--space-1.5: 6px;    /* 1.5 */
--space-2:   8px;    /* 2 */
--space-2.5: 10px;   /* 2.5 */
--space-3:   12px;   /* 3 */
--space-4:   16px;   /* 4 - BASE */
--space-5:   20px;   /* 5 */
--space-6:   24px;   /* 6 */
--space-8:   32px;   /* 8 */
--space-10:  40px;   /* 10 */
--space-12:  48px;   /* 12 */
--space-16:  64px;   /* 16 */
--space-20:  80px;   /* 20 */
--space-24:  96px;   /* 24 */
```

### Spacing Guidelines
- **Nội tại component:** 4-8px (p-1 to p-2)
- **Giữa elements trong component:** 8-12px (gap-2 to gap-3)
- **Giữa components:** 16-24px (gap-4 to gap-6)
- **Giữa sections:** 48-96px (gap-12 to gap-24)

---

## 5. Border Radius

```css
--radius-none: 0;
--radius-sm:   4px;    /* Tags, chips nhỏ */
--radius-md:   8px;    /* Inputs, buttons */
--radius-lg:   12px;   /* Cards */
--radius-xl:   16px;   /* Panels, modals */
--radius-2xl:  20px;   /* Large cards */
--radius-3xl:  24px;   /* Feature cards */
--radius-full: 9999px; /* Pills, avatars, badges */
```

---

## 6. Shadows

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);

/* Focus ring */
--shadow-focus: 0 0 0 3px rgba(99,102,241,0.4);

/* AI glow effect (cho AI features) */
--shadow-ai: 0 0 20px rgba(249,115,22,0.3);
```

---

## 7. Component States

### 7.1 Interactive States

| State | Visual cue | CSS |
|-------|-----------|-----|
| Default | Base style | — |
| Hover | Slightly darker, translateY(-1px) | `hover:` |
| Active/Pressed | Darker, scale(0.98) | `active:` |
| Focus | Blue ring 3px | `focus:` |
| Disabled | 50% opacity, no pointer | `disabled:` |
| Loading | Spinner + text "Đang xử lý..." | `.is-loading` |
| Error | Red border, error message below | `.is-error` |
| Success | Green border, checkmark | `.is-success` |
| Selected | Primary background, white text | `.is-selected` |

### 7.2 Button States Example

```css
.btn-primary {
  /* Default */
  background: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: 600;
  transition: all 150ms ease;
}

.btn-primary:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  background: var(--color-primary-800);
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary.is-loading {
  opacity: 0.8;
  cursor: wait;
  /* Spinner animation inside */
}
```

### 7.3 Form Input States

```css
/* Default */
border: 1.5px solid var(--color-neutral-300);

/* Hover */
border-color: var(--color-neutral-400);

/* Focus */
border-color: var(--color-primary-500);
box-shadow: var(--shadow-focus);

/* Error */
border-color: var(--color-error-500);

/* Success */
border-color: var(--color-success-500);

/* Disabled */
background: var(--color-neutral-100);
opacity: 0.6;
```

---

## 8. Icon Library

### Approach: Lucide React (primary) + Custom SVG

```bash
# Install
npm install lucide-react
```

### Icon Usage Guidelines

| Tình huống | Icon size | Stroke width |
|-----------|-----------|--------------|
| Navigation | 20px | 1.5 |
| Buttons | 16px | 2 |
| Status/Badge | 14px | 2 |
| Hero/Feature | 32-48px | 1.5 |
| Empty state | 64-80px | 1 |

### Icon Mapping (Subject Icons)

```
Toán:        Calculator (Lucide)
Văn:         BookOpen
Tiếng Anh:   Globe
Lý:          Zap
Hóa:         FlaskConical
Sinh:        Leaf
Sử:          Landmark
Địa:         Map
GDCD:        Scale
Tin:         Monitor
Thể dục:     Activity
Âm nhạc:     Music
Mỹ thuật:    Palette
AI/Robot:    Bot
```

---

## 9. Animation & Transitions

### 9.1 Duration Scale

```css
--duration-75:  75ms;   /* Micro (checkbox check, toggle) */
--duration-100: 100ms;  /* Fast (tooltip appear) */
--duration-150: 150ms;  /* Normal (button hover, input focus) */
--duration-200: 200ms;  /* Medium (card hover) */
--duration-300: 300ms;  /* Slow (modal open, sidebar expand) */
--duration-500: 500ms;  /* Page transitions */
--duration-700: 700ms;  /* Long animations */
```

### 9.2 Easing Functions

```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);    /* Most UI transitions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Modals, panels */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful, gamification */
```

### 9.3 Standard Transitions

```css
/* Button hover */
transition: background-color 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out;

/* Card hover */
transition: transform 200ms ease-out, box-shadow 200ms ease-out;

/* Sidebar */
transition: width 300ms ease-in-out;

/* Modal/Dialog */
transition: opacity 200ms ease-out, transform 200ms ease-out;
/* Open: translateY(0) opacity(1); Close: translateY(8px) opacity(0) */

/* Page transition (Next.js) */
transition: opacity 500ms ease-in-out;
```

### 9.4 AI Generation Animation

```css
/* Pulse effect khi AI đang generate */
@keyframes ai-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Typing indicator */
@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

/* Shimmer loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 10. Breakpoints (Mobile-first)

```css
--screen-sm:  640px;   /* Small tablets, large phones landscape */
--screen-md:  768px;   /* Tablets */
--screen-lg:  1024px;  /* Small desktops, tablets landscape */
--screen-xl:  1280px;  /* Desktops */
--screen-2xl: 1536px;  /* Large desktops */
```

### Layout Strategy per Breakpoint

| Breakpoint | Layout | Sidebar | Content cols |
|-----------|--------|---------|--------------|
| `< 640px` | Stack | Hidden (drawer) | 1 col |
| `640-768px` | Stack | Hidden (drawer) | 1-2 col |
| `768-1024px` | Side-by-side | Icon-only (64px) | 2-3 col |
| `1024-1280px` | Side-by-side | Collapsed (240px) | 3 col |
| `> 1280px` | Side-by-side | Expanded (280px) | 4 col |

### Mobile-specific Guidelines
- Tối thiểu 44x44px cho mọi tap target
- Bottom navigation cho Mobile (5 items max)
- Swipe gestures cho cards và carousels
- Sticky headers, scrollable content area
- Keyboard avoidance cho form inputs

---

## 11. Dark Mode

### Approach: CSS Variables + Tailwind `dark:` class

```css
/* Light mode (default) */
:root {
  --bg-primary:    #FFFFFF;
  --bg-secondary:  #F8FAFC;
  --bg-tertiary:   #F1F5F9;
  --text-primary:  #0F172A;
  --text-secondary:#475569;
  --text-muted:    #94A3B8;
  --border:        #E2E8F0;
}

/* Dark mode */
.dark {
  --bg-primary:    #0F172A;
  --bg-secondary:  #1E293B;
  --bg-tertiary:   #334155;
  --text-primary:  #F8FAFC;
  --text-secondary:#CBD5E1;
  --text-muted:    #64748B;
  --border:        #334155;
}
```

### Dark Mode Notes
- User preference lưu trong localStorage + system `prefers-color-scheme`
- Ảnh/media cần `filter: brightness(0.8)` ở dark mode
- Charts/graphs cần dark variants riêng
- AI glow effects đẹp hơn ở dark mode

---

## 12. Grid System

```css
/* Container widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1400px; /* Max width cho content */

/* Column grid: 12-column base */
/* Gap: 16px mobile, 24px desktop */
```

### Layout Patterns

```
Dashboard:
  [Sidebar 280px] + [Main content fluid]

Course Studio:
  [Sidebar 280px] + [Tree panel 320px] + [Editor fluid]

Lesson Viewer:
  [Content 65%] + [AI Tutor panel 35%]

Question Bank:
  [Filter 260px] + [Questions grid fluid]
```

---

## 13. Elevation Model

Hệ thống 5 cấp độ elevation (z-index):

| Level | z-index | Component |
|-------|---------|-----------|
| Base | 0 | Content, cards |
| Raised | 10 | Sticky headers |
| Dropdown | 100 | Dropdowns, tooltips |
| Modal | 200 | Dialogs, modals |
| Toast | 300 | Notifications, toasts |
| Critical | 400 | Loading overlay |

---

*Design system này phải được implement vào `tailwind.config.js` và CSS variables. Mỗi component mới phải tuân theo system này trước khi ship.*
