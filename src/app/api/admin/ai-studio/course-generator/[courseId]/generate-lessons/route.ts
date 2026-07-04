import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

type RouteContext = { params: Promise<{ courseId: string }> }

// Build prompt to generate full lesson content for a subject
function buildLessonContentPrompt(p: {
  courseName: string
  curriculum: string
  subjectName: string
  subjectDescription: string | null
  grade: string
  subject: string
  lessonTitles: string[]
}): string {
  const gradeLabel = p.grade === 'preschool' ? 'Mầm non' : `Lớp ${p.grade}`
  const lessonList = p.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')

  return `Bạn là chuyên gia giáo dục của AvaB — nền tảng học K12 chất lượng cao tại Việt Nam.

Tạo NỘI DUNG BÀI GIẢNG CHI TIẾT cho chuyên đề sau:
- Khóa học: ${p.courseName}
- Chương trình: ${p.curriculum}
- Khối lớp: ${gradeLabel}
- Môn học: ${p.subject}
- Chuyên đề: ${p.subjectName}
${p.subjectDescription ? `- Mô tả: ${p.subjectDescription}` : ''}

Các bài học trong chuyên đề:
${lessonList}

Tạo nội dung markdown đầy đủ cho TỪNG BÀI HỌC theo thứ tự. Mỗi bài học bao gồm:

## [Số thứ tự]. [Tên bài]

### 🎯 Mục tiêu
- Liệt kê 3-4 mục tiêu học tập cụ thể

### 📖 Kiến thức trọng tâm
[Lý thuyết đầy đủ, rõ ràng, phù hợp lứa tuổi ${gradeLabel}]
[Có ví dụ minh họa cụ thể]
[Sử dụng bảng, danh sách khi cần]

### ✏️ Ví dụ thực hành
[2-3 ví dụ có hướng dẫn giải chi tiết]

### 💡 Ghi nhớ
[Công thức / quy tắc / điểm mấu chốt cần nhớ — dạng bullet ngắn gọn]

---

Yêu cầu:
- Viết bằng tiếng Việt, phù hợp ${gradeLabel}
- Mỗi bài 400-600 từ
- Dùng markdown chuẩn (##, ###, **, -, bảng)
- Có tính kết nối logic giữa các bài
- Dễ đọc, dễ in ấn`
}

// POST — generate lesson content for all subjects in a course
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const body = await req.json() as { subjectId?: string } // optional: generate for one subject only

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: {
          where: body.subjectId ? { id: body.subjectId } : { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            materials: {
              where: { type: 'lesson-outline' },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const results: { subjectId: string; subjectName: string; status: 'ok' | 'error'; error?: string }[] = []

    for (const subject of course.subjects) {
      try {
        // Skip subjects that already have THEORY content
        const existingTheory = await prisma.subjectMaterial.findFirst({
          where: { subjectId: subject.id, type: 'THEORY' },
        })
        if (existingTheory) {
          results.push({ subjectId: subject.id, subjectName: subject.name, status: 'ok' })
          continue
        }

        const lessonTitles = subject.materials.map(m => m.title ?? '').filter(Boolean)
        if (lessonTitles.length === 0) {
          results.push({ subjectId: subject.id, subjectName: subject.name, status: 'ok' })
          continue
        }

        const prompt = buildLessonContentPrompt({
          courseName:         course.name,
          curriculum:         course.curriculumId ?? 'K12-VN',
          subjectName:        subject.name,
          subjectDescription: subject.description,
          grade:              course.gradeMin != null ? String(course.gradeMin) : 'preschool',
          subject:            course.subjectCode ?? course.courseType ?? 'GENERAL',
          lessonTitles,
        })

        const completion = await openai.chat.completions.create({
          model:       'gpt-4o',
          messages:    [{ role: 'user', content: prompt }],
          max_tokens:  4000,
          temperature: 0.7,
        })

        const content = completion.choices[0]?.message?.content ?? ''

        if (content) {
          await prisma.subjectMaterial.create({
            data: {
              subjectId: subject.id,
              type:      'THEORY',
              title:     `Bài giảng — ${subject.name}`,
              content,
            },
          })
        }

        results.push({ subjectId: subject.id, subjectName: subject.name, status: 'ok' })
      } catch (err) {
        results.push({
          subjectId:   subject.id,
          subjectName: subject.name,
          status:      'error',
          error:       String(err),
        })
      }
    }

    const successCount = results.filter(r => r.status === 'ok').length

    return NextResponse.json({ success: true, generated: successCount, total: results.length, results })
  } catch (err) {
    console.error('[Lesson Generator] POST error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
