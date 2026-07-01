# AvaB — Nền tảng Luyện Thi Học Bổng Vào Lớp 1

> 🏆 Giải Nhất vòng Trường | Giải Nhì cụm Nam–Bắc Từ Liêm | Giải Ba Thành phố Hà Nội
> Cuộc thi "Ý tưởng Khởi nghiệp Sáng tạo" — Nhóm TenGo

Website: **avab.vn**

---

## 📋 Tổng quan

AvaB là nền tảng luyện thi học bổng vào lớp 1 các trường chất lượng cao tại Hà Nội (Lương Thế Vinh, Nguyễn Siêu, Vinschool...), với phương pháp Toán Tư Duy đỉnh cao được phát triển bởi chính các học sinh xuất sắc đạt giải quốc tế.

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + Lucide Icons |
| Auth | NextAuth.js v5 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| File Storage | Supabase Storage |
| Deploy | Vercel |
| Email | Nodemailer (SMTP) |

## 🚀 Bắt đầu

### 1. Clone & cài đặt

```bash
cd code_projects/avab
npm install
```

### 2. Cấu hình môi trường

Sao chép `.env.local` và điền thông tin:

```bash
cp .env.local .env.local.backup
```

Cần cấu hình:
- `DATABASE_URL` — PostgreSQL connection string (Supabase)
- `NEXTAUTH_SECRET` — Secret key ngẫu nhiên
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- SMTP settings (Gmail app password)

### 3. Setup database

```bash
npx prisma migrate dev --name init
npm run seed
```

### 4. Chạy dev

```bash
npm run dev
```

Truy cập: http://localhost:3000

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── (trang chính)
│   │   ├── page.tsx              # Trang chủ
│   │   ├── gioi-thieu/           # Giới thiệu + org chart
│   │   ├── khoa-hoc/             # Khoá học + quiz
│   │   ├── thi-truong/           # Phân tích thị trường
│   │   ├── mo-hinh-kinh-doanh/   # Business model
│   │   ├── tai-chinh/            # Tài chính
│   │   ├── tin-tuc/              # Tin tức
│   │   ├── bang-vang/            # Bảng vàng top 10
│   │   ├── tuyen-dung/           # Tuyển dụng
│   │   ├── dang-ky/              # Đăng ký tài khoản
│   │   └── dang-nhap/            # Đăng nhập
│   │
│   ├── hoc-vien/                 # Dashboard học viên
│   │
│   ├── admin/                    # Admin CMS
│   │   ├── courses/              # Quản lý khoá học
│   │   ├── subjects/             # Quản lý chuyên đề
│   │   ├── enrollments/          # Duyệt đăng ký
│   │   └── users/                # Quản lý người dùng
│   │
│   └── api/                      # API Routes
│       ├── auth/                 # Auth endpoints
│       ├── courses/              # Course API
│       ├── subjects/             # Subject API
│       ├── answers/              # Submit answers
│       ├── leaderboard/          # Top 10
│       ├── news/                 # News API
│       ├── recruitment/          # Recruitment API
│       ├── registration/         # Register interest
│       ├── upload/               # File upload
│       └── admin/                # Admin-only APIs
│
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── home/                     # Homepage sections
│   ├── courses/                  # Course + Quiz UI
│   ├── admin/                    # Admin components
│   └── shared/                   # Shared UI components
│
└── lib/
    ├── prisma.ts                 # Prisma client
    ├── auth.ts                   # NextAuth config
    └── supabase.ts               # Supabase client
```

## 🎨 Màu sắc thương hiệu

| Màu | Hex | Dùng cho |
|-----|-----|----------|
| Purple | `#7C3AED` | Primary, CTA chính |
| Teal | `#14B8A6` | Secondary, success |
| Red | `#EF4444` | Accent, error |
| Yellow | `#FBBF24` | Star, highlight |

## 👥 Admin CMS

Truy cập: `/admin`

Tính năng:
- ✅ CRUD khoá học
- ✅ CRUD chuyên đề (tab: lý thuyết, video, bài tập, đáp án)
- ✅ Upload file PDF/Word → tự động parse câu hỏi
- ✅ Duyệt đăng ký mua khoá học
- ✅ Thêm thủ công học sinh (nhập SĐT)
- ✅ Chấm điểm tự động
- ✅ Xem bảng xếp hạng học sinh theo chuyên đề

## 📊 Mô hình kinh doanh

- **Khoá học online**: 100+ học sinh/năm, đi kèm 10 buổi dạy online
- **500+ phụ huynh** quan tâm hàng năm
- **Tầm nhìn 2033**: Doanh thu 15 tỷ, mở rộng Toán Tư Duy từ lớp 1-9 + Tiếng Anh + Lập trình

## 🔐 Roles

| Role | Quyền |
|------|-------|
| ADMIN | Toàn quyền CMS |
| TEACHER | Quản lý chuyên đề, xem học sinh |
| STUDENT | Học bài, làm bài tập |
| PARENT | Theo dõi tiến độ con |

## Deploy

```bash
# Vercel (recommended)
vercel deploy

# Hoặc
vercel --prod
```

Đặt các biến môi trường trong Vercel Dashboard → Settings → Environment Variables.

---

Phát triển bởi **TenGo Team** | Leader: Bảo Nam | Website: avab.vn
