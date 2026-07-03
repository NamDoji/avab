import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

type RouteContext = { params: Promise<{ courseId: string }> }

type ContentType = 'homework' | 'answers' | 'quiz' | 'teacher-guide' | 'video-script'

const MATERIAL_TYPE: Record<ContentType, string> = {
  'homework':      'HOMEWORK',
  'answers':       'ANSWER_KEY',
  'quiz':          'QUIZ',
  'teacher-guide': 'TEACHER_GUIDE',
  'video-script':  'VIDEO_SCRIPT',
}

// ── Prompt builders ──────────────────────────────────────────────────────────

function buildHomeworkPrompt(p: {
  courseName: string; subjectName: string; grade: string; subject: string
  lessonTitles: string[]
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  const lessonList = p.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')
  return `Bạn là chuyên gia giáo dục AvaB. Tạo BÀI TẬP VỀ NHÀ cho chuyên đề sau:
- Khóa học: ${p.courseName}
- Chuyên đề: ${p.subjectName}
- Khối lớp: ${gradeLabel}
- Môn: ${p.subject}
- Các bài học: ${lessonList}

Tạo đúng 30 câu bài tập về nhà chia đều cho các bài học. Định dạng:

# 📝 Bài Tập Về Nhà — ${p.subjectName}

## Phần 1: Trắc nghiệm (10 câu)
**Câu 1.** [Nội dung câu hỏi]
A. ... B. ... C. ... D. ...

## Phần 2: Điền vào chỗ trống (10 câu)
**Câu 11.** [Nội dung]
Đáp án: ___________

## Phần 3: Tự luận (10 câu)
**Câu 21.** [Nội dung bài toán/câu hỏi]

---
Yêu cầu: đa dạng mức độ (nhớ/hiểu/vận dụng/nâng cao), bằng tiếng Việt, phù hợp ${gradeLabel}.`
}

function buildAnswerKeyPrompt(p: {
  courseName: string; subjectName: string; grade: string; subject: string
  homeworkContent: string
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  return `Bạn là chuyên gia giáo dục AvaB. Tạo ĐÁP ÁN CHI TIẾT cho bộ bài tập về nhà sau:

${p.homeworkContent}

---
Tạo đáp án đầy đủ, định dạng:

# ✅ Đáp Án Chi Tiết — ${p.subjectName}

## Phần 1: Trắc nghiệm
**Câu 1.** [Đáp án] — *Giải thích ngắn gọn tại sao*

## Phần 2: Điền vào chỗ trống
**Câu 11.** [Đáp án] — *Cách nhớ / quy tắc liên quan*

## Phần 3: Tự luận
**Câu 21.**
**Hướng dẫn giải:**
[Các bước giải chi tiết]
**Kết quả:** ...

---
Phù hợp ${gradeLabel}, tiếng Việt, rõ ràng để giáo viên chấm bài.`
}

function buildQuizPrompt(p: {
  courseName: string; subjectName: string; grade: string; subject: string
  lessonTitles: string[]
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  const lessonList = p.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')
  return `Bạn là chuyên gia giáo dục AvaB. Tạo ĐỀ KIỂM TRA cho chuyên đề:
- Khóa học: ${p.courseName}
- Chuyên đề: ${p.subjectName}  
- Khối lớp: ${gradeLabel}
- Môn: ${p.subject}
- Nội dung đã học: ${lessonList}

Tạo đề kiểm tra 45 phút (20 câu), định dạng:

# 📊 Đề Kiểm Tra — ${p.subjectName}
**Thời gian:** 45 phút | **Lớp:** ${gradeLabel} | **Điểm:** 10

---

## I. TRẮC NGHIỆM (5 điểm — 10 câu × 0.5đ)
**Câu 1.** ...
A. ... B. ... C. ... D. ...

## II. ĐIỀN KHUYẾT (2 điểm — 4 câu × 0.5đ)
**Câu 11.** ...

## III. TỰ LUẬN (3 điểm — 3 bài)
**Bài 1. (1đ)** ...
**Bài 2. (1đ)** ...
**Bài 3. (1đ)** ...

---

# ✅ ĐÁP ÁN VÀ BIỂU ĐIỂM
[Đáp án kèm biểu điểm chi tiết cho từng câu]

---
Phù hợp ${gradeLabel}, bao phủ toàn bộ nội dung chuyên đề.`
}

function buildTeacherGuidePrompt(p: {
  courseName: string; subjectName: string; grade: string; subject: string
  lessonTitles: string[]; theoryContent?: string
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  const lessonList = p.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')
  return `Bạn là chuyên gia giáo dục AvaB. Tạo HƯỚNG DẪN GIẢNG DẠY cho giáo viên:
- Khóa học: ${p.courseName}
- Chuyên đề: ${p.subjectName}
- Khối lớp: ${gradeLabel}
- Môn: ${p.subject}
- Các bài học: ${lessonList}

Tạo tài liệu hướng dẫn giáo viên đầy đủ:

# 👩‍🏫 Hướng Dẫn Giảng Dạy — ${p.subjectName}
**Dành cho:** Giáo viên ${p.subject} | **Khối lớp:** ${gradeLabel}

## 📋 Tổng Quan Chuyên Đề
- Thời lượng: X tiết
- Mục tiêu tổng quát
- Kiến thức tiên quyết học sinh cần có

## 🗓️ Kế Hoạch Dạy Từng Bài

Cho mỗi bài học:
### Bài [số]: [Tên bài]
**Thời lượng:** X phút
**Mục tiêu:** ...
**Chuẩn bị:** đồ dùng, phương tiện dạy học
**Tiến trình:**
1. Khởi động (5 phút): ...
2. Bài mới (X phút): ...
3. Luyện tập (X phút): ...
4. Củng cố (5 phút): ...
**Lưu ý sư phạm:** ...
**Câu hỏi gợi mở:** ...

## 💡 Phương Pháp & Kỹ Thuật Dạy Học
- Phương pháp phù hợp với chuyên đề
- Cách xử lý học sinh yếu / giỏi

## 🚩 Những Lỗi Phổ Biến Cần Lưu Ý
[Các sai lầm thường gặp của học sinh và cách khắc phục]

## 📎 Tài Liệu Tham Khảo
[Sách giáo khoa, tài liệu bổ trợ gợi ý]`
}

function buildVideoScriptPrompt(p: {
  courseName: string; subjectName: string; grade: string; subject: string
  lessonTitles: string[]; theoryContent?: string
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  const lessonList = p.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')
  return `Bạn là chuyên gia nội dung giáo dục AvaB. Tạo KỊCH BẢN VIDEO BÀI GIẢNG cho:
- Khóa học: ${p.courseName}
- Chuyên đề: ${p.subjectName}
- Khối lớp: ${gradeLabel}
- Môn: ${p.subject}
- Các bài học: ${lessonList}

Tạo kịch bản video bài giảng hoàn chỉnh, định dạng:

# 🎬 Kịch Bản Video — ${p.subjectName}
**Thời lượng ước tính:** ~15-20 phút | **Khối lớp:** ${gradeLabel}

---

## 🎙️ INTRO (30 giây)
**[Hình ảnh/Slide: Logo AvaB + tên chuyên đề]**
*Giáo viên nói:*
"Xin chào các em! Hôm nay chúng ta sẽ cùng nhau khám phá chuyên đề [tên]..."

---

Cho mỗi bài học:

## 📖 BÀI [số]: [Tên bài] (~X phút)

### [SLIDE 1 — Tiêu đề bài]
**Hình ảnh:** [Mô tả slide/animation cần làm]
*Giáo viên nói:*
"[Lời thoại tự nhiên, phù hợp ${gradeLabel}]"

### [SLIDE 2 — Kiến thức chính]
**Hình ảnh:** [Mô tả hình ảnh minh họa]
*Giáo viên nói:*
"[Lời giải thích...]"

**[ĐIỂM DỪNG]** ← Giáo viên đặt câu hỏi tương tác

---

## 🏁 OUTRO (30 giây)
*Giáo viên nói:*
"Hôm nay chúng ta đã học được... Các em nhớ làm bài tập về nhà nhé!"

---
Lưu ý: Lời thoại tự nhiên như đang dạy thật, phù hợp ${gradeLabel}, có điểm dừng tương tác.`
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const body = await req.json() as { contentType: ContentType; subjectId?: string; force?: boolean }
    const { contentType, subjectId, force = false } = body

    if (!MATERIAL_TYPE[contentType]) {
      return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 })
    }

    const materialType = MATERIAL_TYPE[contentType]

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: {
          where: subjectId ? { id: subjectId } : { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            materials: {
              where: { type: { in: ['lesson-outline', 'HOMEWORK', 'THEORY'] } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const grade     = course.gradeMin != null ? String(course.gradeMin) : 'preschool'
    const subject   = course.subjectCode ?? course.courseType ?? 'GENERAL'
    const results: { subjectId: string; subjectName: string; status: 'ok' | 'skipped' | 'error'; error?: string }[] = []

    for (const sub of course.subjects) {
      try {
        // Skip if already exists (unless force regenerate)
        if (!force) {
          const existing = await prisma.subjectMaterial.findFirst({
            where: { subjectId: sub.id, type: materialType },
          })
          if (existing) {
            results.push({ subjectId: sub.id, subjectName: sub.name, status: 'skipped' })
            continue
          }
        }

        const lessonTitles = sub.materials
          .filter(m => m.type === 'lesson-outline')
          .map(m => m.title ?? '')
          .filter(Boolean)

        if (lessonTitles.length === 0) {
          results.push({ subjectId: sub.id, subjectName: sub.name, status: 'skipped' })
          continue
        }

        const theoryMaterial = sub.materials.find(m => m.type === 'THEORY')
        const theoryContent  = theoryMaterial?.content ?? undefined

        // Answers require existing homework
        if (contentType === 'answers') {
          const hwMaterial = sub.materials.find(m => m.type === 'HOMEWORK')
          if (!hwMaterial?.content) {
            results.push({ subjectId: sub.id, subjectName: sub.name, status: 'skipped' })
            continue
          }
        }

        let prompt = ''
        const base = { courseName: course.name, subjectName: sub.name, grade, subject, lessonTitles }

        switch (contentType) {
          case 'homework':
            prompt = buildHomeworkPrompt(base)
            break
          case 'answers': {
            const hwMat = sub.materials.find(m => m.type === 'HOMEWORK')
            prompt = buildAnswerKeyPrompt({ ...base, homeworkContent: hwMat?.content ?? '' })
            break
          }
          case 'quiz':
            prompt = buildQuizPrompt(base)
            break
          case 'teacher-guide':
            prompt = buildTeacherGuidePrompt({ ...base, theoryContent })
            break
          case 'video-script':
            prompt = buildVideoScriptPrompt({ ...base, theoryContent })
            break
        }

        const completion = await openai.chat.completions.create({
          model:       'gpt-4o',
          messages:    [{ role: 'user', content: prompt }],
          max_tokens:  4000,
          temperature: 0.7,
        })

        const content = completion.choices[0]?.message?.content ?? ''

        if (content) {
          const titles: Record<ContentType, string> = {
            'homework':      `Bài tập về nhà — ${sub.name}`,
            'answers':       `Đáp án chi tiết — ${sub.name}`,
            'quiz':          `Đề kiểm tra — ${sub.name}`,
            'teacher-guide': `Hướng dẫn giảng dạy — ${sub.name}`,
            'video-script':  `Kịch bản video — ${sub.name}`,
          }

          // Delete old if force regenerating
          if (force) {
            await prisma.subjectMaterial.deleteMany({
              where: { subjectId: sub.id, type: materialType },
            })
          }

          await prisma.subjectMaterial.create({
            data: { subjectId: sub.id, type: materialType, title: titles[contentType], content },
          })
        }

        results.push({ subjectId: sub.id, subjectName: sub.name, status: 'ok' })
      } catch (err) {
        results.push({ subjectId: sub.id, subjectName: sub.name, status: 'error', error: String(err) })
      }
    }

    const generated = results.filter(r => r.status === 'ok').length
    const skipped   = results.filter(r => r.status === 'skipped').length

    return NextResponse.json({ success: true, contentType, generated, skipped, total: results.length, results })
  } catch (err) {
    console.error('[Content Generator] POST error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
