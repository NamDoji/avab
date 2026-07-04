import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopicItem {
  order: number
  name: string
  description: string
  icon: string
  lessons: string[]
}

interface CourseStructure {
  courseDescription: string
  topics: TopicItem[]
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildCourseStructurePrompt(p: {
  courseName: string
  curriculum: string
  grade: string
  subjectName: string
  objective: string
  numTopics: number
  lessonsPerTopic: number
}): string {
  return `Bạn là chuyên gia giáo dục của AvaB — nền tảng học K12 chất lượng cao tại Việt Nam.

Tạo CẤU TRÚC KHÓA HỌC đầy đủ cho:
- Tên khóa học: ${p.courseName}
- Chương trình: ${p.curriculum}
- Khối lớp: ${p.grade}
- Môn học: ${p.subjectName}
- Định hướng/Mục tiêu: ${p.objective}
- Số chuyên đề: ${p.numTopics}
- Số bài mỗi chuyên đề: ${p.lessonsPerTopic}

Trả về JSON hợp lệ (KHÔNG bọc trong markdown code block, chỉ JSON thuần):
{
  "courseDescription": "Mô tả khóa học ngắn gọn 2-3 câu",
  "topics": [
    {
      "order": 1,
      "name": "Tên chuyên đề 1",
      "description": "Mô tả ngắn về nội dung chuyên đề",
      "icon": "📐",
      "lessons": ["Bài 1: Tên bài", "Bài 2: Tên bài", "Bài 3: Tên bài"]
    }
  ]
}

Yêu cầu bắt buộc:
- Đúng ${p.numTopics} chuyên đề trong mảng "topics"
- Mỗi chuyên đề có đúng ${p.lessonsPerTopic} bài học trong mảng "lessons"
- Tên chuyên đề và bài học cụ thể, phù hợp chương trình ${p.curriculum} khối ${p.grade}
- Sắp xếp từ cơ bản đến nâng cao, có logic học tập rõ ràng
- Icon là emoji phù hợp với nội dung chuyên đề
- Viết bằng tiếng Việt, chuyên nghiệp, rõ ràng`
}

// ─── POST — generate & save full course structure ─────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    const body = await req.json() as {
      courseName: string
      curriculum: string
      grade: string
      subject: string
      subjectName: string
      objective?: string
      numTopics: number
      lessonsPerTopic: number
      homeworkCount?: number
      quizCount?: number
    }

    const { courseName, curriculum, grade, subject, subjectName, objective, numTopics, lessonsPerTopic, homeworkCount, quizCount } = body

    if (!courseName?.trim() || !grade || !subject) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: courseName, grade, subject' },
        { status: 400 },
      )
    }

    const nTopics   = Math.min(Math.max(Number(numTopics)       || 5,  1), 50)
    const nLessons  = Math.min(Math.max(Number(lessonsPerTopic) || 4,  1), 50)
    const nHomework = Math.min(Math.max(Number(homeworkCount)   || 30, 1), 50)
    const nQuiz     = Math.min(Math.max(Number(quizCount)       || 20, 1), 50)
    const subjName = subjectName?.trim() || subject

    // ── Step 1: Generate course structure with AI ─────────────────────────
    let structure: CourseStructure
    try {
      const completion = await openai.chat.completions.create({
        model:       'gpt-4o-mini',
        max_tokens:  4096,
        temperature: 0.7,
        messages: [
          {
            role:    'system',
            content: 'Bạn là chuyên gia giáo dục K12 của AvaB. Chỉ trả về JSON hợp lệ, không có markdown, không có giải thích thêm.',
          },
          {
            role:    'user',
            content: buildCourseStructurePrompt({
              courseName:     courseName.trim(),
              curriculum:     curriculum ?? 'K12-VN',
              grade,
              subjectName:    subjName,
              objective:      objective?.trim() || 'Phát triển toàn diện năng lực học sinh',
              numTopics:      nTopics,
              lessonsPerTopic: nLessons,
            }),
          },
        ],
      })

      const raw     = completion.choices[0]?.message?.content ?? '{}'
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      structure     = JSON.parse(cleaned) as CourseStructure
    } catch (aiErr) {
      console.error('[Course Generator] AI error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed', details: String(aiErr) }, { status: 500 })
    }

    // ── Step 2: Create Course + Subjects + Lesson outlines in DB ─────────
    const gradeCode  = grade === 'preschool' ? 'MN' : `L${String(grade).padStart(2, '0')}`
    const subjCode   = subject.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 6)
    const ts         = Date.now().toString(36).toUpperCase()
    const courseCode = `${subjCode}-${gradeCode}-${ts}`
    const gradeNum   = grade === 'preschool' ? 0 : parseInt(grade)

    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.course.create({
        data: {
          code:        courseCode,
          name:        courseName.trim(),
          description: structure.courseDescription,
          subjectCode: subject,
          subjectName: subjName,
          gradeMin:    gradeNum,
          gradeMax:    gradeNum,
          courseType:  subject, // legacy compat
          homeworkCount: nHomework,
          quizCount:     nQuiz,
          isActive:      false,
          isPublic:      false, // org-private until explicitly published to platform
        },
      })

      for (const topic of structure.topics) {
        const sub = await tx.subject.create({
          data: {
            courseId:    created.id,
            order:       topic.order,
            name:        topic.name,
            icon:        topic.icon ?? '📚',
            description: topic.description,
            isActive:    true,
          },
        })

        // Store lesson titles as subject materials (lesson-outline)
        for (let i = 0; i < (topic.lessons ?? []).length; i++) {
          await tx.subjectMaterial.create({
            data: {
              subjectId: sub.id,
              type:      'lesson-outline',
              title:     topic.lessons[i],
              content:   null,
            },
          })
        }
      }

      return created
    })

    // ── Step 3: Create AIProject for tracking ────────────────────────────
    await prisma.aIProject.create({
      data: {
        title:       `[Khóa học] ${courseName.trim()}`,
        curriculum:  curriculum ?? 'K12-VN',
        grade,
        subject,
        subjectName: subjName,
        topic:       `Course Generator — ${courseName.trim()}`,
        objective:   objective?.trim() ?? null,
        difficulty:  'medium',
        status:      'in-progress',
        createdBy:   userId,
        steps: {
          create: {
            stepNum:  1,
            stepType: 'setup',
            status:   'done',
            content:  JSON.stringify({ courseId: course.id, courseCode, numTopics: nTopics }),
            metadata: { courseId: course.id, numTopics: nTopics, lessonsPerTopic: nLessons },
            doneAt:   new Date(),
          },
        },
      },
    })

    return NextResponse.json({
      success:   true,
      courseId:  course.id,
      courseCode,
      structure,
    }, { status: 201 })
  } catch (err) {
    console.error('[Course Generator] POST error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
